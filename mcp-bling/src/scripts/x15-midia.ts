/**
 * Sobe as fotos da X15 de catalogo/scooter-x15/<cor>/ e associa a 1ª à variante da cor.
 *   npx tsx --env-file=.env src/scripts/x15-midia.ts <pasta-cor> <NomeVariante> [ordem: 01,03,...]
 * ex: npx tsx --env-file=.env src/scripts/x15-midia.ts prateado Prateado 01,03,04,06,09,05,07,08,02
 * Fotos 22-24/nov: anúncio ML MLBU5823223052 (prata), via script de console.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const req = (n: string) => { const v = process.env[n]; if (!v) throw new Error(`.env faltando ${n}`); return v }
const STORE = req('SHOPIFY_STORE')
const HANDLE = 'scooter-eletrica-dc-azm-x15-1000w-aro-14-bateria-de-litio-removivel'
const [pasta, variante, ordemArg] = process.argv.slice(2)
if (!pasta || !variante) throw new Error('uso: <pasta-cor> <NomeVariante> [ordem]')
const DIR = join(dirname(fileURLToPath(import.meta.url)), '../../../catalogo/scooter-x15', pasta)
const arquivos = ordemArg ? ordemArg.split(',').map((n) => `${n}.webp`) : readdirSync(DIR).filter((f) => /\.(webp|jpe?g|png)$/i.test(f)).sort()

const token = (await (await fetch(`https://${STORE}/admin/oauth/access_token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grant_type: 'client_credentials', client_id: req('SHOPIFY_CLIENT_ID'), client_secret: req('SHOPIFY_CLIENT_SECRET') }) })).json() as any).access_token
async function gql(query: string, variables?: unknown): Promise<any> {
  const d: any = await (await fetch(`https://${STORE}/admin/api/2026-07/graphql.json`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token }, body: JSON.stringify({ query, variables }) })).json()
  if (d.errors) throw new Error(JSON.stringify(d.errors))
  return d.data
}
const p = (await gql(`query($h: String!) { productByHandle(handle: $h) { id title variants(first: 20) { nodes { id title } } } }`, { h: HANDLE })).productByHandle
const v = p.variants.nodes.find((x: any) => x.title === variante)
if (!v) throw new Error(`variante ${variante} não existe`)

const fontes: string[] = []
for (const f of arquivos) {
  const path = join(DIR, f)
  const mimeType = f.endsWith('.webp') ? 'image/webp' : f.endsWith('.png') ? 'image/png' : 'image/jpeg'
  const filename = `scooter-azm-x15-${pasta}-${f}`
  const s = (await gql(`mutation($i: [StagedUploadInput!]!) { stagedUploadsCreate(input: $i) { stagedTargets { url resourceUrl parameters { name value } } userErrors { message } } }`,
    { i: [{ resource: 'IMAGE', filename, mimeType, httpMethod: 'POST', fileSize: String(statSync(path).size) }] })).stagedUploadsCreate
  if (s.userErrors.length) throw new Error(JSON.stringify(s.userErrors))
  const t = s.stagedTargets[0]; const form = new FormData()
  for (const x of t.parameters) form.append(x.name, x.value)
  form.append('file', new Blob([readFileSync(path)], { type: mimeType }), filename)
  const up = await fetch(t.url, { method: 'POST', body: form }); if (!up.ok) throw new Error(`upload ${f}: ${up.status}`)
  fontes.push(t.resourceUrl); console.log('upload', f)
}
const m = (await gql(`mutation($id: ID!, $media: [CreateMediaInput!]) { productUpdate(product: { id: $id }, media: $media) { product { id } userErrors { field message } } }`,
  { id: p.id, media: fontes.map((src, i) => ({ originalSource: src, mediaContentType: 'IMAGE', alt: `${p.title} — ${variante}${i ? ` — imagem ${i + 1}` : ''}` })) })).productUpdate
if (m.userErrors.length) throw new Error(JSON.stringify(m.userErrors))

let novas: any[] = []
for (let k = 0; k < 30; k++) {
  await new Promise((r) => setTimeout(r, 2000))
  const all = (await gql(`query($id: ID!) { product(id: $id) { media(first: 100) { nodes { id status alt } } } }`, { id: p.id })).product.media.nodes
  novas = all.filter((n: any) => n.alt?.includes(`— ${variante}`))
  if (novas.length >= fontes.length && novas.every((n: any) => n.status === 'READY')) break
  if (novas.some((n: any) => n.status === 'FAILED')) throw new Error('mídia FAILED')
}
const capa = novas.find((n: any) => n.alt.endsWith(`— ${variante}`))
const b = (await gql(`mutation($pid: ID!, $v: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $pid, variants: $v) { userErrors { message } } }`,
  { pid: p.id, v: [{ id: v.id, mediaId: capa.id }] })).productVariantsBulkUpdate
if (b.userErrors.length) throw new Error(JSON.stringify(b.userErrors))
console.log(`ok: ${novas.length} imagens, capa da variante ${variante} = ${capa.id}`)
