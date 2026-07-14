/**
 * PONTE de estoque Bling → Shopify (contorna o push nativo quebrado do Bling).
 *
 * Lê o saldo real do Bling (fonte de verdade) e escreve na Shopify via Admin API.
 * O token da Shopify é gerado na hora por `client_credentials` (app "Bling Estoque"
 * do Dev Dashboard) — expira em 24h, então cada execução minta um novo. Ideal p/ cron.
 *
 *   npx tsx src/scripts/sync-estoque-shopify.ts --dry   # mostra o que mudaria, NÃO escreve
 *   npx tsx src/scripts/sync-estoque-shopify.ts         # sincroniza estoque
 *
 * .env necessário: SHOPIFY_STORE, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET, SHOPIFY_LOCATION_ID
 *
 * Regras:
 *  - casa por SKU (Shopify) == codigo (Bling), normalizado.
 *  - só mexe em variação com inventário RASTREADO (tracked). Untracked (ISD/em breve) pula.
 *  - só escreve se o saldo Shopify != saldo Bling (evita PUT desnecessário).
 *  - saldo Bling = saldoVirtualTotal (todos os depósitos).
 */
import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { withBling } from '../api/client.js'

const dry = process.argv.includes('--dry')
const STORE = req('SHOPIFY_STORE')
const CLIENT_ID = req('SHOPIFY_CLIENT_ID')
const CLIENT_SECRET = req('SHOPIFY_CLIENT_SECRET')
const LOCATION_ID = req('SHOPIFY_LOCATION_ID')

function req(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`.env faltando ${name}`)
  return v
}
const norm = (s: string) => s.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim()

async function mintToken(): Promise<string> {
  const r = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  })
  const d: any = await r.json()
  if (!d.access_token) throw new Error(`mint falhou: ${JSON.stringify(d)}`)
  return d.access_token
}

async function shopifyGQL(token: string, query: string, variables?: unknown): Promise<any> {
  const r = await fetch(`https://${STORE}/admin/api/2026-07/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  })
  const d: any = await r.json()
  if (d.errors) throw new Error(`GQL erro: ${JSON.stringify(d.errors)}`)
  return d.data
}

/** SKU → { inventoryItemId, tracked, qty } de todos os produtos Shopify. */
async function mapaShopify(token: string) {
  const mapa = new Map<string, { itemId: string; tracked: boolean; qty: number }>()
  let cursor: string | null = null
  do {
    const data = await shopifyGQL(token, `
      query($cursor: String) {
        products(first: 100, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          edges { node { variants(first: 3) { edges { node {
            sku inventoryQuantity inventoryItem { id tracked }
          } } } } }
        }
      }`, { cursor })
    for (const pe of data.products.edges) {
      for (const ve of pe.node.variants.edges) {
        const v = ve.node
        if (!v.sku) continue
        mapa.set(norm(v.sku), { itemId: v.inventoryItem.id, tracked: !!v.inventoryItem.tracked, qty: Number(v.inventoryQuantity) || 0 })
      }
    }
    cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null
  } while (cursor)
  return mapa
}

/** codigo(SKU) → saldoVirtualTotal do Bling. */
async function saldosBling() {
  const prods: any[] = []
  for (let pg = 1; pg <= 4; pg++) {
    const r: any = await withBling((b) => b.produtos.get({ pagina: pg, limite: 100 } as any))
    const d = r.data ?? []
    prods.push(...d)
    if (d.length < 100) break
  }
  const ids = prods.map((p) => p.id)
  const saldo = new Map<string, number>()      // norm(codigo) -> saldo
  const codByNorm = new Map<string, string>()   // norm(codigo) -> codigo original
  for (const p of prods) if (p.codigo) codByNorm.set(norm(String(p.codigo)), String(p.codigo))
  // getBalances em lotes
  for (let i = 0; i < ids.length; i += 50) {
    const lote = ids.slice(i, i + 50)
    const r: any = await withBling((b) => b.estoques.getBalances({ idsProdutos: lote } as any))
    for (const row of r.data ?? []) {
      const cod = prods.find((p) => p.id === row.produto?.id)?.codigo
      if (cod) saldo.set(norm(String(cod)), Number(row.saldoVirtualTotal) || 0)
    }
  }
  return { saldo, codByNorm }
}

async function main() {
  console.log(`🔑 gerando token Shopify (${STORE})...`)
  const token = await mintToken()
  console.log(`📦 lendo Shopify + Bling...`)
  const [shop, { saldo, codByNorm }] = await Promise.all([mapaShopify(token), saldosBling()])
  console.log(`   Shopify: ${shop.size} SKUs | Bling: ${saldo.size} com saldo`)

  const updates: { sku: string; itemId: string; de: number; para: number }[] = []
  let semShopify = 0, untracked = 0, iguais = 0
  for (const [k, para] of saldo) {
    const s = shop.get(k)
    if (!s) { semShopify++; continue }
    if (!s.tracked) { untracked++; continue }
    if (s.qty === para) { iguais++; continue }
    updates.push({ sku: codByNorm.get(k) ?? k, itemId: s.itemId, de: s.qty, para })
  }

  console.log(`\n📊 ${updates.length} a atualizar | ${iguais} já iguais | ${untracked} untracked (pula) | ${semShopify} sem produto na Shopify`)
  for (const u of updates) console.log(`   ${u.sku.padEnd(28).slice(0, 28)} ${String(u.de).padStart(5)} → ${u.para}`)

  if (dry) { console.log(`\n🧪 DRY — nada escrito.`); return }
  if (!updates.length) { console.log(`\n✅ nada a fazer.`); return }

  // escreve em lotes de 100 (1 mutation com N quantities)
  let ok = 0
  for (let i = 0; i < updates.length; i += 100) {
    const lote = updates.slice(i, i + 100)
    // API 2026-07: InventoryQuantityInput exige changeFromQuantity (= saldo atual "de onde").
    const quantities = lote.map((u) => ({ inventoryItemId: u.itemId, locationId: LOCATION_ID, quantity: u.para, changeFromQuantity: u.de }))
    // 2026-07 exige a diretiva @idempotent com chave única por request.
    const key = randomUUID()
    const data = await shopifyGQL(token, `
      mutation($q: [InventoryQuantityInput!]!, $key: String!) {
        inventorySetQuantities(input: { reason: "correction", name: "available", quantities: $q }) @idempotent(key: $key) {
          inventoryAdjustmentGroup { reason }
          userErrors { field message }
        }
      }`, { q: quantities, key })
    const errs = data.inventorySetQuantities.userErrors
    if (errs?.length) console.log(`   ⚠️ erros no lote: ${JSON.stringify(errs)}`)
    else ok += lote.length
  }
  console.log(`\n✅ ${ok}/${updates.length} estoques sincronizados na Shopify.`)
}

main().catch((e) => { console.error('FALHA:', e); process.exit(1) })
