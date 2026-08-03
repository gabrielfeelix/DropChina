/**
 * Diff READ-ONLY Bling ↔ Shopify, casando por SKU (codigo == sku).
 * Não escreve nada. Mostra divergência de nome, preço, estoque, status e
 * quem existe só de um lado.
 *
 *   npx tsx src/scripts/compare-bling-shopify.ts
 *
 * .env: SHOPIFY_STORE, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET
 */
import 'dotenv/config'
import { withBling } from '../api/client.js'

const STORE = req('SHOPIFY_STORE')
const CLIENT_ID = req('SHOPIFY_CLIENT_ID')
const CLIENT_SECRET = req('SHOPIFY_CLIENT_SECRET')

function req(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`.env faltando ${name}`)
  return v
}
const norm = (s?: string) => (s ?? '').normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim()

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

async function gql(token: string, query: string, variables?: unknown): Promise<any> {
  const r = await fetch(`https://${STORE}/admin/api/2026-07/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  })
  const d: any = await r.json()
  if (d.errors) throw new Error(`GQL erro: ${JSON.stringify(d.errors)}`)
  return d.data
}

interface Shop {
  id: string
  title: string
  status: string
  updatedAt: string
  sku: string
  price: number
  qty: number
  tracked: boolean
  capa: string | null
}

async function puxarShopify(token: string): Promise<Shop[]> {
  const out: Shop[] = []
  let cursor: string | null = null
  do {
    const d: any = await gql(
      token,
      `query($cursor: String) {
        products(first: 100, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          edges { node {
            id title status updatedAt
            featuredMedia { preview { image { url } } }
            variants(first: 1) { edges { node { sku price inventoryQuantity inventoryItem { tracked } } } }
          } }
        }
      }`,
      { cursor },
    )
    for (const e of d.products.edges) {
      const n = e.node
      const v = n.variants.edges[0]?.node
      out.push({
        id: n.id.split('/').pop(),
        title: n.title,
        status: n.status,
        updatedAt: n.updatedAt,
        sku: v?.sku ?? '',
        price: Number(v?.price ?? 0),
        qty: v?.inventoryQuantity ?? 0,
        tracked: !!v?.inventoryItem?.tracked,
        capa: n.featuredMedia?.preview?.image?.url ?? null,
      })
    }
    cursor = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null
  } while (cursor)
  return out
}

async function puxarBling() {
  const out: any[] = []
  for (let pagina = 1; pagina <= 10; pagina++) {
    const res: any = await withBling((b) => b.produtos.get({ pagina, limite: 100 } as any))
    const data: any[] = res?.data ?? []
    out.push(...data)
    if (data.length < 100) break
  }
  return out
}

const token = await mintToken()
const [shop, bling] = await Promise.all([puxarShopify(token), puxarBling()])

const porSku = new Map<string, Shop>()
for (const s of shop) if (s.sku) porSku.set(norm(s.sku), s)

console.log(`\nBling: ${bling.length} produtos · Shopify: ${shop.length} produtos\n`)

const soBling: any[] = []
const difNome: string[] = []
const difPreco: string[] = []
const difEstoque: string[] = []
const arquivados: string[] = []

for (const b of bling) {
  const s = porSku.get(norm(b.codigo))
  if (!s) {
    soBling.push(b)
    continue
  }
  if (s.status !== 'ACTIVE') arquivados.push(`  [${s.status}] "${b.codigo}" | ${s.title}`)
  if (norm(b.nome) !== norm(s.title))
    difNome.push(`  "${b.codigo}"\n     Bling  : ${b.nome}\n     Shopify: ${s.title}`)
  if (Number(b.preco) !== s.price)
    difPreco.push(`  "${b.codigo}" | Bling R$ ${b.preco} → Shopify R$ ${s.price} | ${b.nome.slice(0, 60)}`)
  const saldo = b.estoque?.saldoVirtualTotal ?? 0
  if (s.tracked && saldo !== s.qty)
    difEstoque.push(`  "${b.codigo}" | Bling ${saldo} → Shopify ${s.qty} | ${b.nome.slice(0, 60)}`)
}

const skusBling = new Set(bling.map((b: any) => norm(b.codigo)))
const soShopify = shop.filter((s) => !skusBling.has(norm(s.sku)))

const bloco = (t: string, linhas: string[]) => {
  console.log(`### ${t} (${linhas.length})`)
  linhas.forEach((l) => console.log(l))
  console.log('')
}

bloco('PREÇO DIVERGENTE', difPreco)
bloco('ESTOQUE DIVERGENTE', difEstoque)
bloco('NOME DIVERGENTE', difNome)
bloco('NÃO-ATIVOS NA SHOPIFY (mas ativos no Bling)', arquivados)
bloco(
  'SÓ NO BLING (sem produto na Shopify)',
  soBling.map((b: any) => `  "${b.codigo}" | ${b.nome}`),
)
bloco(
  'SÓ NA SHOPIFY (sem SKU correspondente no Bling)',
  soShopify.map((s) => `  [${s.status}] "${s.sku}" | ${s.title}`),
)
bloco(
  'SEM IMAGEM DE CAPA NA SHOPIFY',
  shop.filter((s) => !s.capa).map((s) => `  "${s.sku}" | ${s.title}`),
)

const esgotado = shop.filter((s) => s.tracked && s.qty <= 0 && s.status === 'ACTIVE')
console.log(`### ESGOTADOS E PUBLICADOS — aparecem apagados na vitrine (${esgotado.length})`)
esgotado.forEach((s) => console.log(`  "${s.sku}" | R$ ${s.price} | ${s.title.slice(0, 70)}`))
console.log('')
