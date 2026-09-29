/**
 * Cria na Shopify os 8 filamentos Bambu (PLA Lite + PLA Basic) como RASCUNHO, com imagens.
 * As imagens sobem por staged upload e ficam na CDN da Shopify — essas URLs alimentam o
 * `--imagens` do criar-filamentos-bambu.ts (Bling em modo URL externa).
 *
 *   npx tsx src/scripts/criar-filamentos-shopify.ts            # DRY: só lê, imprime o que faria
 *   npx tsx src/scripts/criar-filamentos-shopify.ts --apply    # cria (status DRAFT)
 *   npx tsx src/scripts/criar-filamentos-shopify.ts --apply --only PLA-LITE-BRANCO-BAMBU
 *
 * Idempotente por SKU: se já existe produto com o SKU, pula.
 * Saídas (--apply): catalogo/filamentos-bambu/shopify-result.json e shopify-imagens.json ({sku: [urls]}).
 * Estoque NÃO é lançado aqui — vem do Bling pela ponte de estoque depois do vínculo.
 */
import 'dotenv/config'
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { CAT_DIR, JSON_IN, lerDescricoes, descricaoDe, type Item } from './filamentos-bambu-dados.js'

const IMG_DIR = join(CAT_DIR, 'filamentos-bambu')
const OUT = join(IMG_DIR, 'shopify-result.json')
const OUT_IMG = join(IMG_DIR, 'shopify-imagens.json')

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? args[i + 1] : undefined })()

const STORE = req('SHOPIFY_STORE')

// Seleção de imagens (29/09): capa + vaso na cor quando ≥480px; 130px descartadas.
// A foto da linha (carretéis lado a lado) entra em todos os Lite.
const LINHA_LITE = 'pla-lite-cinza/04.webp'
const IMAGENS: Record<string, string[]> = {
  'PLA-LITE-BRANCO-BAMBU': ['pla-lite-branco/01.webp', 'pla-lite-branco/02.webp', LINHA_LITE],
  'PLA-LITE-PRETO-BAMBU': ['pla-lite-preto/01.webp', LINHA_LITE],
  'PLA-LITE-AZUL-BAMBU': ['pla-lite-azul/01.webp', LINHA_LITE],
  'PLA-LITE-AMARELO-GIRASSOL-BAMBU': ['pla-lite-amarelo-girassol/01.webp', 'pla-lite-amarelo-girassol/02.webp', LINHA_LITE],
  'PLA-LITE-CINZA-BAMBU': ['pla-lite-cinza/01.webp', 'pla-lite-cinza/02.webp', LINHA_LITE],
  'PLA-LITE-VERDE-BAMBU': ['pla-lite-verde/01.webp', 'pla-lite-verde/02.webp', LINHA_LITE],
  'PLA-LITE-VERMELHO-BAMBU': ['pla-lite-vermelho/01.webp', 'pla-lite-vermelho/02.webp', LINHA_LITE],
  'PLA-BASIC-LARANJA-BAMBU': ['pla-basic-laranja/oficial-01.jpg', 'pla-basic-laranja/02.webp', 'pla-basic-laranja/03.webp', '_shared-pla-basic/oficial-shared-04.jpg'],
}

// Cores que entram na coleção de Natal (tag campanha-natal).
const NATAL = new Set(['Vermelho', 'Verde', 'Branco', 'Amarelo Girassol', 'Amarelo'])

function req(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`.env faltando ${name}`)
  return v
}
const slug = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '-')

async function mintToken(): Promise<string> {
  const r = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: req('SHOPIFY_CLIENT_ID'), client_secret: req('SHOPIFY_CLIENT_SECRET') }),
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

async function existePorSku(token: string, sku: string): Promise<string | null> {
  const d = await gql(token, `query($q: String!) { productVariants(first: 5, query: $q) { nodes { sku product { id } } } }`, { q: `sku:"${sku}"` })
  return d.productVariants.nodes.find((v: any) => v.sku === sku)?.product.id ?? null
}

/** Staged upload de um arquivo local → resourceUrl para usar como originalSource. */
async function subirImagem(token: string, rel: string): Promise<string> {
  const path = join(IMG_DIR, rel)
  const mimeType = extname(path) === '.webp' ? 'image/webp' : 'image/jpeg'
  const filename = rel.replace(/\//g, '-')
  const d = await gql(token, `mutation($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } }
    }`, { input: [{ resource: 'IMAGE', filename, mimeType, httpMethod: 'POST', fileSize: String(statSync(path).size) }] })
  const s = d.stagedUploadsCreate
  if (s.userErrors.length) throw new Error(`staged upload ${rel}: ${JSON.stringify(s.userErrors)}`)
  const alvo = s.stagedTargets[0]
  const form = new FormData()
  for (const p of alvo.parameters) form.append(p.name, p.value)
  form.append('file', new Blob([readFileSync(path)], { type: mimeType }), filename)
  const up = await fetch(alvo.url, { method: 'POST', body: form })
  if (!up.ok) throw new Error(`upload ${rel}: HTTP ${up.status}`)
  return alvo.resourceUrl
}

function montarInput(it: Item, html: string, fontes: string[]) {
  const linhaTag = `linha-${slug(it.linha)}`
  const material = `material-${slug(it.linha.split(' ')[0])}`
  const tags = ['categoria-impressao-3d', 'categoria-filamentos', 'marca-bambu-lab', material, linhaTag, `cor-${slug(it.cor)}`]
  if (NATAL.has(it.cor)) tags.push('campanha-natal')
  return {
    title: it.nome,
    descriptionHtml: html,
    vendor: 'Bambu Lab',
    productType: 'Filamentos 3D',
    tags,
    status: 'DRAFT',
    seo: {
      title: `${it.nome} | DropChina`,
      description: `${it.nome}: 1,75 mm, carretel reutilizável com chip RFID, compatível com AMS. 8% OFF no Pix e envio rápido.`,
    },
    productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
    variants: [{
      optionValues: [{ optionName: 'Title', name: 'Default Title' }],
      sku: it.sku,
      barcode: it.gtin,
      price: it.preco.toFixed(2),
      inventoryPolicy: 'DENY',
      inventoryItem: {
        tracked: true,
        ...(it.custo != null ? { cost: it.custo.toFixed(2) } : {}),
        measurement: { weight: { value: 1.2, unit: 'KILOGRAMS' } },
      },
    }],
    files: fontes.map((src, i) => ({ originalSource: src, contentType: 'IMAGE', alt: i === 0 ? it.nome : `${it.nome} — imagem ${i + 1}` })),
  }
}

async function main() {
  const dados = JSON.parse(readFileSync(JSON_IN, 'utf8'))
  const itens: Item[] = dados.produtos.filter((p: Item) => !only || p.sku === only)
  const descs = lerDescricoes()
  const token = await mintToken()

  if (apply) console.log('\n######## MODO ESCRITA — criando produtos na Shopify (DRAFT) ########\n')
  else console.log('\n[DRY] nada será escrito. Use --apply para criar.\n')

  const resultado: Record<string, { productId: string; handle: string }> = {}
  const imagens: Record<string, string[]> = {}

  for (const it of itens) {
    const rels = it.imagens ?? IMAGENS[it.sku]
    if (!rels) throw new Error(`${it.sku}: sem seleção de imagens`)
    const ja = await existePorSku(token, it.sku)
    if (ja) { console.log(`${it.sku} | já existe ${ja} — pulando`); continue }

    const { html } = descricaoDe(it, descs)
    if (!apply) {
      const input = montarInput(it, html.slice(0, 60) + '…', rels.map((r) => `<upload:${r}>`))
      console.log(`${it.sku}\n${JSON.stringify(input, null, 1)}\n`)
      continue
    }

    const fontes: string[] = []
    for (const r of rels) fontes.push(await subirImagem(token, r))

    const d = await gql(token, `mutation($input: ProductSetInput!) {
        productSet(input: $input, synchronous: true) {
          product { id handle }
          userErrors { field message }
        }
      }`, { input: montarInput(it, html, fontes) })
    const ps = d.productSet
    if (ps.userErrors.length) throw new Error(`${it.sku}: ${JSON.stringify(ps.userErrors)}`)
    resultado[it.sku] = { productId: ps.product.id, handle: ps.product.handle }
    console.log(`${it.sku} | criado ${ps.product.id} | ${ps.product.handle}`)
  }

  // A mídia processa de forma assíncrona: espera ficar READY para ter as URLs da CDN.
  for (const [sku, { productId }] of Object.entries(resultado)) {
    for (let t = 0; t < 15; t++) {
      const d = await gql(token, `query($id: ID!) { product(id: $id) { media(first: 10) { nodes { status ... on MediaImage { image { url } } } } } }`, { id: productId })
      const nodes = d.product.media.nodes
      if (nodes.every((n: any) => n.status === 'READY')) { imagens[sku] = nodes.map((n: any) => n.image.url); break }
      if (nodes.some((n: any) => n.status === 'FAILED')) throw new Error(`${sku}: imagem FAILED no processamento`)
      await new Promise((r) => setTimeout(r, 2000))
    }
    console.log(`${sku} | ${imagens[sku]?.length ?? 0} imagens na CDN`)
  }

  if (apply) {
    const merge = (f: string, novo: object) => {
      let atual = {}
      try { atual = JSON.parse(readFileSync(f, 'utf8')) } catch {}
      writeFileSync(f, JSON.stringify({ ...atual, ...novo }, null, 2) + '\n')
    }
    merge(OUT, resultado)
    merge(OUT_IMG, imagens)
    console.log(`\nresultado -> ${basename(OUT)}, ${basename(OUT_IMG)}`)
  }
}

main().catch((e) => { console.error('FALHA:', e instanceof Error ? e.message : e); process.exit(1) })
