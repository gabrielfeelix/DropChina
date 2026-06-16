/**
 * FASE 4 — Limpeza dos produtos DEMO da Shopify.
 *
 * Contexto: a loja tem ~28 produtos de montagem/demo (SKU limpo, padrão DIFERENTE
 * do Bling → não casam). O catálogo real virá do Bling via export (Bling = fonte
 * de verdade). Antes do export, zera-se a vitrine pra não duplicar nem deixar órfão.
 *
 * SEGURANÇA:
 *  - DRY por padrão: só lista, não apaga.
 *  - Sempre grava BACKUP (JSON) de todos os produtos antes de qualquer delete.
 *  - Só apaga com --confirm. Delete na Shopify NÃO é reversível (o backup guarda os dados).
 *  - Rodar ANTES do export Bling→Shopify. Se rodar depois, apaga o catálogo real também.
 *
 *   node catalogo/limpar-demos.mjs                    # DRY: lista + backup, não apaga
 *   node catalogo/limpar-demos.mjs --confirm          # apaga TODOS os produtos atuais
 *   node catalogo/limpar-demos.mjs --store=xxx.myshopify.com --confirm
 *
 * Pré: `shopify store auth --store=dropchina-9753.myshopify.com --scopes=write_products,read_products`
 */
import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const CONFIRM = args.includes('--confirm')
const STORE = (args.find((a) => a.startsWith('--store='))?.split('=')[1]) || 'dropchina-9753.myshopify.com'

function exec(query, variables = {}) {
  const res = spawnSync(
    'shopify',
    ['store', 'execute', `--store=${STORE}`, '--allow-mutations', '--query', query, '--variables', JSON.stringify(variables)],
    { encoding: 'utf8' },
  )
  if (res.status !== 0) {
    console.error('CLI error:', res.stderr)
    throw new Error('shopify CLI exited non-zero')
  }
  const stdout = res.stdout
  const jsonStart = stdout.indexOf('{\n')
  if (jsonStart < 0) throw new Error('Resposta não-JSON do CLI:\n' + stdout)
  return JSON.parse(stdout.slice(jsonStart))
}

const Q_LIST = `query($cursor: String) {
  products(first: 100, after: $cursor) {
    edges { node {
      id title handle status totalInventory
      variants(first: 1) { edges { node { sku price } } }
    } }
    pageInfo { hasNextPage endCursor }
  }
}`

const M_DELETE = `mutation($input: ProductDeleteInput!) {
  productDelete(input: $input) { deletedProductId userErrors { field message } }
}`

async function listarTodos() {
  const out = []
  let cursor = null
  do {
    const r = exec(Q_LIST, { cursor })
    const p = r.data?.products
    if (!p) throw new Error('Sem data.products — auth ok? store certa?')
    for (const e of p.edges) {
      const v = e.node.variants?.edges?.[0]?.node
      out.push({ id: e.node.id, title: e.node.title, handle: e.node.handle, status: e.node.status, estoque: e.node.totalInventory, sku: v?.sku ?? '', preco: v?.price ?? '' })
    }
    cursor = p.pageInfo.hasNextPage ? p.pageInfo.endCursor : null
  } while (cursor)
  return out
}

function main() {
  console.log(`\n🏪 Store: ${STORE}  |  modo: ${CONFIRM ? '⚠️  CONFIRM (vai apagar)' : '🧪 DRY (só lista)'}\n`)
  const produtos = listarTodos()
  console.log(`${produtos.length} produto(s) na loja:\n`)
  console.log('  SKU'.padEnd(28), 'estoq', 'título')
  for (const p of produtos) console.log('  ' + (p.sku || '(sem sku)').padEnd(26), String(p.estoque).padStart(4), ' ' + p.title.slice(0, 50))

  // Backup sempre (mesmo em dry) — usa timestamp ISO sem ":" pra nome de arquivo.
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const bkp = join(__dirname, `_backup-produtos-${stamp}.json`)
  writeFileSync(bkp, JSON.stringify(produtos, null, 2))
  console.log(`\n💾 Backup salvo: ${bkp}`)

  if (!CONFIRM) {
    console.log(`\n👉 DRY. Confira que são TODOS demo (SKU limpo tipo EVO-..., HP-...).`)
    console.log(`   Pra apagar: node catalogo/limpar-demos.mjs --confirm\n`)
    return
  }

  console.log(`\n🗑️  Apagando ${produtos.length} produto(s)...`)
  let ok = 0, erro = 0
  for (const p of produtos) {
    const r = exec(M_DELETE, { input: { id: p.id } })
    const errs = r.data?.productDelete?.userErrors ?? []
    if (errs.length) { erro++; console.error(`   ❌ ${p.title.slice(0, 40)}: ${errs.map((e) => e.message).join(', ')}`) }
    else { ok++; console.log(`   ✔ ${p.sku || p.title.slice(0, 40)}`) }
  }
  console.log(`\n✅ Apagados: ${ok} | erros: ${erro}. Backup em ${bkp}\n`)
}

main()
