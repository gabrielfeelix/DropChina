/**
 * Reconcilia EXCLUSÕES Bling → Shopify.
 *
 * O Bling não propaga exclusão pra loja (documentado: "deve-se excluir também na
 * plataforma da loja virtual"). Este script fecha esse buraco: acha produto que
 * está EXCLUÍDO no Bling e ainda ATIVO na Shopify, e ARQUIVA na loja.
 *
 *   npx tsx src/scripts/sync-exclusoes-shopify.ts --dry   # mostra, NÃO escreve
 *   npx tsx src/scripts/sync-exclusoes-shopify.ts         # arquiva
 *
 * .env: SHOPIFY_STORE, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET
 *
 * Notas:
 *  - Arquiva, não exclui. Some da loja, mantém histórico, é reversível no painel.
 *  - Casa por VÍNCULO multiloja (produto Bling → id Shopify), não por SKU. O SKU
 *    da loja pode estar desatualizado; o vínculo é por id e não mente.
 *  - `produtos.get` esconde excluídos por padrão. Excluído = `criterio: 4`.
 */
import 'dotenv/config'
import { withBling } from '../api/client.js'

const dry = process.argv.includes('--dry')
const ID_LOJA = 206107628

const STORE = req('SHOPIFY_STORE')
const CLIENT_ID = req('SHOPIFY_CLIENT_ID')
const CLIENT_SECRET = req('SHOPIFY_CLIENT_SECRET')

function req(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`.env faltando ${name}`)
  return v
}

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

/** Produtos EXCLUÍDOS no Bling (lixeira). */
async function excluidosNoBling() {
  const out: any[] = []
  for (let pagina = 1; pagina <= 10; pagina++) {
    const res: any = await withBling((b) => b.produtos.get({ criterio: 4, pagina, limite: 100 } as any))
    const data: any[] = res?.data ?? []
    out.push(...data)
    if (data.length < 100) break
  }
  return out
}

/** Vínculos multiloja: id do produto Bling → id do produto na Shopify. */
async function vinculos() {
  const mapa = new Map<number, string>()
  for (let pagina = 1; pagina <= 10; pagina++) {
    const res: any = await withBling((b) => b.produtosLojas.get({ idLoja: ID_LOJA, pagina, limite: 100 } as any))
    const data: any[] = res?.data ?? []
    for (const v of data) if (v?.produto?.id && v?.codigo) mapa.set(v.produto.id, String(v.codigo))
    if (data.length < 100) break
  }
  return mapa
}

const [excluidos, mapa, token] = await Promise.all([excluidosNoBling(), vinculos(), mintToken()])

console.log(`\nExcluídos no Bling: ${excluidos.length} · vínculos com a loja: ${mapa.size}\n`)

const alvos: { idShopify: string; codigo: string; nome: string }[] = []
for (const p of excluidos) {
  const idShopify = mapa.get(p.id)
  if (!idShopify) continue
  alvos.push({ idShopify, codigo: p.codigo ?? '', nome: p.nome })
}

if (!alvos.length) {
  console.log('Nada a fazer — nenhum excluído do Bling tem produto vinculado na loja.\n')
  process.exit(0)
}

// Só mexe no que ainda está publicado.
const status: any = await gql(
  token,
  `query($ids: [ID!]!) { nodes(ids: $ids) { ... on Product { id title status } } }`,
  { ids: alvos.map((a) => `gid://shopify/Product/${a.idShopify}`) },
)
const porId = new Map<string, any>()
for (const n of status.nodes ?? []) if (n?.id) porId.set(n.id.split('/').pop(), n)

const pendentes = alvos.filter((a) => porId.get(a.idShopify)?.status === 'ACTIVE')
const jaOk = alvos.length - pendentes.length

console.log(`Já arquivados/ausentes: ${jaOk} · a arquivar: ${pendentes.length}\n`)
for (const a of pendentes) console.log(`  ${dry ? '[DRY] ' : ''}arquivar ${a.idShopify} "${a.codigo}" | ${a.nome.slice(0, 60)}`)

if (dry) {
  console.log('\n--dry: nada foi escrito.\n')
  process.exit(0)
}

let ok = 0
for (const a of pendentes) {
  const d: any = await gql(
    token,
    `mutation($id: ID!) {
      productUpdate(product: {id: $id, status: ARCHIVED}) {
        product { id status }
        userErrors { field message }
      }
    }`,
    { id: `gid://shopify/Product/${a.idShopify}` },
  )
  const erros = d.productUpdate?.userErrors ?? []
  if (erros.length) console.error(`  ERRO ${a.idShopify}: ${JSON.stringify(erros)}`)
  else ok++
}

console.log(`\n${ok}/${pendentes.length} arquivados.\n`)
