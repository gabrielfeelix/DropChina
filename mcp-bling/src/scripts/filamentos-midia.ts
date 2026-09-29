/**
 * Galeria + descrição rica dos filamentos Bambu na Shopify, só com imagens oficiais Bambu.
 *
 *   npx tsx src/scripts/filamentos-midia.ts                 # DRY: lista o que faria
 *   npx tsx src/scripts/filamentos-midia.ts --apply         # PLA (lote padrão)
 *   npx tsx src/scripts/filamentos-midia.ts --apply --dados ../catalogo/filamentos-bambu-petg-2026-09.json
 *
 * 1. Troca a galeria do produto pela seleção de `imagensDe()` (staged upload; apaga a mídia antiga).
 * 2. Grava a descrição (descricoes.md): foto da cor = imagem da galeria; banners = assets do tema
 *    (`dc-asset:`), que precisam estar publicados (theme/assets/dc-fil-*.webp).
 * O app da API não tem write_files — por isso nada vai para Conteúdo › Arquivos.
 * Depois: rodar criar-filamentos-bambu.ts --apply --imagens shopify-imagens.json para o Bling
 * receber as mesmas imagens e descrição (o Bling sobe nome/descrição para a loja sozinho).
 */
import 'dotenv/config'
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { CAT_DIR, JSON_IN, IMAGENS_MAP, lerDescricoes, descricaoDe, imagensDe, type Item } from './filamentos-bambu-dados.js'

const IMG_DIR = join(CAT_DIR, 'filamentos-bambu')
const RESULT = join(IMG_DIR, 'shopify-result.json')
const apply = process.argv.includes('--apply')
const only = (() => { const i = process.argv.indexOf('--only'); return i >= 0 ? process.argv[i + 1] : undefined })()
const STORE = req('SHOPIFY_STORE')

function req(n: string): string { const v = process.env[n]; if (!v) throw new Error(`.env faltando ${n}`); return v }
const lerJson = (f: string) => { try { return JSON.parse(readFileSync(f, 'utf8')) } catch { return {} } }
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function mintToken(): Promise<string> {
  const r = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: req('SHOPIFY_CLIENT_ID'), client_secret: req('SHOPIFY_CLIENT_SECRET') }),
  })
  const d: any = await r.json()
  if (!d.access_token) throw new Error(`mint falhou: ${JSON.stringify(d)}`)
  return d.access_token
}

async function gql(token: string, query: string, variables?: unknown): Promise<any> {
  const r = await fetch(`https://${STORE}/admin/api/2026-07/graphql.json`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  })
  const d: any = await r.json()
  if (d.errors) throw new Error(`GQL erro: ${JSON.stringify(d.errors)}`)
  return d.data
}

/** Arquivo local → staged upload (resource IMAGE) → resourceUrl, aceito como originalSource de mídia. */
async function subirImagem(token: string, rel: string): Promise<string> {
  const path = join(IMG_DIR, rel)
  const mimeType = extname(path) === '.webp' ? 'image/webp' : 'image/jpeg'
  const filename = `dropchina-${rel.replace(/\//g, '-')}`
  const s = (await gql(token, `mutation($i: [StagedUploadInput!]!) { stagedUploadsCreate(input: $i) {
      stagedTargets { url resourceUrl parameters { name value } } userErrors { message } } }`,
    { i: [{ resource: 'IMAGE', filename, mimeType, httpMethod: 'POST', fileSize: String(statSync(path).size) }] })).stagedUploadsCreate
  if (s.userErrors.length) throw new Error(`${rel}: ${JSON.stringify(s.userErrors)}`)
  const alvo = s.stagedTargets[0]
  const form = new FormData()
  for (const p of alvo.parameters) form.append(p.name, p.value)
  form.append('file', new Blob([readFileSync(path)], { type: mimeType }), filename)
  const up = await fetch(alvo.url, { method: 'POST', body: form })
  if (!up.ok) throw new Error(`upload ${rel}: HTTP ${up.status}`)
  return alvo.resourceUrl
}

async function main() {
  const itens: Item[] = JSON.parse(readFileSync(JSON_IN, 'utf8')).produtos.filter((p: Item) => !only || p.sku === only)
  const produtos = lerJson(RESULT) as Record<string, { productId: string }>
  const token = await mintToken()
  console.log(apply ? '\n######## MODO ESCRITA — Shopify ########\n' : '\n[DRY] nada será escrito. Use --apply.\n')

  // galeria, depois descrição (a descrição usa a URL da galeria)
  const descs = lerDescricoes()
  const imagens: Record<string, string[]> = lerJson(IMAGENS_MAP)
  for (const it of itens) {
    const pid = produtos[it.sku]?.productId
    if (!pid) { console.log(`${it.sku}: sem produto na Shopify — pulando`); continue }
    const gal = imagensDe(it).galeria
    if (!apply) { console.log(`${it.sku}: galeria ${gal.join(', ')} + descrição rica`); continue }

    const fontes: string[] = []
    for (const rel of gal) fontes.push(await subirImagem(token, rel))
    const atual = (await gql(token, `query($id: ID!) { product(id: $id) { media(first: 20) { nodes { id } } } }`, { id: pid })).product.media.nodes
    if (atual.length) {
      const del = (await gql(token, `mutation($p: ID!, $m: [ID!]!) { productDeleteMedia(productId: $p, mediaIds: $m) { mediaUserErrors { message } } }`,
        { p: pid, m: atual.map((n: any) => n.id) })).productDeleteMedia
      if (del.mediaUserErrors.length) throw new Error(`${it.sku}: ${JSON.stringify(del.mediaUserErrors)}`)
    }
    const cm = (await gql(token, `mutation($id: ID!, $media: [CreateMediaInput!]!) {
        productUpdate(product: { id: $id }, media: $media) { userErrors { message } } }`,
      { id: pid, media: fontes.map((src, i) => ({ originalSource: src, mediaContentType: 'IMAGE', alt: i === 0 ? it.nome : `${it.nome} — imagem ${i + 1}` })) })).productUpdate
    if (cm.userErrors.length) throw new Error(`${it.sku}: ${JSON.stringify(cm.userErrors)}`)
    for (let t = 0; t < 30; t++) {
      const nodes = (await gql(token, `query($id: ID!) { product(id: $id) { media(first: 20) { nodes { status ... on MediaImage { image { url } } } } } }`, { id: pid })).product.media.nodes
      if (nodes.length === gal.length && nodes.every((n: any) => n.status === 'READY')) { imagens[it.sku] = nodes.map((n: any) => n.image.url); break }
      if (nodes.some((n: any) => n.status === 'FAILED')) throw new Error(`${it.sku}: mídia FAILED`)
      await esperar(1500)
    }
    if (!imagens[it.sku]) throw new Error(`${it.sku}: galeria não ficou pronta`)
    writeFileSync(IMAGENS_MAP, JSON.stringify(imagens, null, 2) + '\n')

    const html = descricaoDe(it, descs).html
    if (html.includes('{IMG_')) throw new Error(`${it.sku}: descrição com marcador de imagem sem URL`)
    const u = (await gql(token, `mutation($id: ID!, $html: String!) { productUpdate(product: { id: $id, descriptionHtml: $html }) { userErrors { message } } }`,
      { id: pid, html })).productUpdate
    if (u.userErrors.length) throw new Error(`${it.sku}: ${JSON.stringify(u.userErrors)}`)
    console.log(`${it.sku} | ${imagens[it.sku]?.length ?? 0}/${gal.length} imagens | descrição ${html.length} caracteres`)
  }
}

main().catch((e) => { console.error('FALHA:', e instanceof Error ? e.message : e); process.exit(1) })
