/**
 * Cria a Scooter Elétrica DC AZM X15 na Shopify, no mesmo molde da X13
 * (gid://shopify/Product/10441739272411): opção Cor, 6 variantes, 10 un. cada,
 * 65 kg, metafields dropchina.pix_price / installments_max.
 *
 *   npx tsx src/scripts/criar-x15-shopify.ts            # DRY: imprime o payload
 *   npx tsx src/scripts/criar-x15-shopify.ts --apply    # cria (status DRAFT, sem fotos)
 *   npx tsx src/scripts/criar-x15-shopify.ts --update   # reaplica título/handle/descrição/SEO
 *
 * Fotos entram depois (o Augusto manda); só então o produto vai para ACTIVE.
 * Ficha: anúncio ML MLBU5823223052 (colada pelo Gabriel em 24/nov) — aro 14 tubeless, brushless, bateria removível.
 * Preço: cartão 6.000 (10x 600) · Pix 5.000 — conforme banner da home (22/nov).
 * .env: SHOPIFY_STORE, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET, SHOPIFY_LOCATION_ID
 */
const apply = process.argv.includes('--apply')
const req = (n: string) => { const v = process.env[n]; if (!v) throw new Error(`.env faltando ${n}`); return v }
const STORE = req('SHOPIFY_STORE')
const LOCATION = req('SHOPIFY_LOCATION_ID')

const TITULO = 'Scooter Elétrica DC AZM X15 1000W Aro 14 Bateria de Lítio Removível'
const PRECO = '6000.00'
const PIX = '5000.0'
const ESTOQUE = 10
const CORES: [string, string][] = [
  ['Branco', 'BRANCO'],
  ['Prateado', 'PRATEADO'],
  ['Preto', 'PRETO'],
  ['Cinza-escuro', 'CINZA-ESCURO'],
]

const DESCRICAO = `<h3>POTÊNCIA E DESEMPENHO</h3>
<p>A AZM X15 combina design de scooter urbana, motor brushless de 1000W e bateria de lítio 48V 20Ah removível para deslocamentos ágeis, econômicos e silenciosos.</p>
<h3>DESTAQUES</h3>
<ul>
<li>Motor brushless (sem escovas) de 1000W</li>
<li>Bateria de Lítio 48V 20Ah removível</li>
<li>Autonomia de até 55 km por carga</li>
<li>Velocidade máxima de 32 km/h</li>
<li>Suporta até 150 kg</li>
<li>Pneus aro 14 sem câmara (tubeless)</li>
<li>Acelerador independente</li>
<li>Painel digital com desbloqueio NFC</li>
<li>Recarga completa em 6 a 8 horas</li>
<li>Farol em LED</li>
<li>Banco com encosto para garupa</li>
</ul>
<h3>FICHA TÉCNICA</h3>
<ul>
<li>Marca: AZM</li>
<li>Modelo: X15</li>
<li>Motor: brushless 1000W</li>
<li>Bateria: lítio 48V / 20Ah, removível</li>
<li>Velocidade máxima: 32 km/h</li>
<li>Autonomia: até 55 km por carga</li>
<li>Capacidade máxima de carga: 150 kg</li>
<li>Pneus: aro 14 tubeless</li>
<li>Dobrável: não</li>
<li>Cores: branco, prateado, cinza-escuro e preto</li>
</ul>
<h3>MONTAGEM</h3>
<p>O produto requer montagem. Junto com a compra enviamos o QR Code com o passo a passo de montagem.</p>
<h3>CUIDADOS E UTILIZAÇÃO</h3>
<p>Siga o manual do fabricante quanto à montagem, recarga, capacidade de carga e manutenção.</p>
<p>A autonomia varia conforme peso transportado, percurso, velocidade, temperatura, calibragem dos pneus e conservação da bateria.</p>
<p>Antes de circular em vias públicas, verifique a classificação do veículo e as exigências legais aplicáveis ao local de uso.</p>
<h3>GARANTIA</h3>
<p>Garantia de fábrica de 3 meses. Emitimos nota fiscal.</p>`

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

const input = {
  title: TITULO,
  handle: 'scooter-eletrica-dc-azm-x15-1000w-aro-14-bateria-de-litio-removivel',
  descriptionHtml: DESCRICAO,
  vendor: 'AZM',
  productType: 'Mobilidade Elétrica',
  tags: ['categoria-mobilidade-eletrica', 'marca-azm', 'scooter-eletrica'],
  status: 'DRAFT',
  seo: {
    title: 'Scooter Elétrica AZM X15 1000W Aro 14 | DropChina',
    description: 'Scooter elétrica AZM X15: motor brushless 1000W, aro 14, bateria de lítio 48V 20Ah removível, até 55 km por carga, 32 km/h e 150 kg. 6 cores. Em até 10x ou mais barato no Pix.',
  },
  metafields: [
    { namespace: 'dropchina', key: 'pix_price', type: 'number_decimal', value: PIX },
    { namespace: 'dropchina', key: 'installments_max', type: 'number_integer', value: '10' },
  ],
  productOptions: [{ name: 'Cor', values: CORES.map(([nome]) => ({ name: nome })) }],
  variants: CORES.map(([nome, cod]) => ({
    optionValues: [{ optionName: 'Cor', name: nome }],
    sku: `DC-AZM-X15-${cod}`,
    price: PRECO,
    inventoryPolicy: 'DENY',
    inventoryItem: { tracked: true, measurement: { weight: { value: 65, unit: 'KILOGRAMS' } } },
    inventoryQuantities: [{ locationId: LOCATION, name: 'available', quantity: ESTOQUE }],
  })),
}

const token = await mintToken()
const ja = await gql(token, `{ productVariants(first: 1, query: "sku:DC-AZM-X15-*") { nodes { sku product { id handle status } } } }`)
if (ja.productVariants.nodes.length) {
  const prod = ja.productVariants.nodes[0].product
  if (!process.argv.includes('--update')) { console.log('X15 já existe (use --update p/ texto):', JSON.stringify(prod)); process.exit(0) }
  const u = await gql(token, `mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { product { id handle title } userErrors { field message } } }`,
    { p: { id: prod.id, title: input.title, handle: input.handle, descriptionHtml: input.descriptionHtml, seo: input.seo } })
  if (u.productUpdate.userErrors.length) throw new Error(JSON.stringify(u.productUpdate.userErrors))
  console.log('atualizado:', JSON.stringify(u.productUpdate.product)); process.exit(0)
}
if (!apply) {
  console.log('[DRY] nada escrito. Use --apply.\n', JSON.stringify({ ...input, descriptionHtml: DESCRICAO.slice(0, 80) + '…' }, null, 1))
  process.exit(0)
}
const d = await gql(token, `mutation($input: ProductSetInput!) {
  productSet(input: $input, synchronous: true) {
    product { id handle status variants(first: 10) { nodes { sku inventoryQuantity } } }
    userErrors { field message }
  }
}`, { input })
if (d.productSet.userErrors.length) throw new Error(JSON.stringify(d.productSet.userErrors))
console.log(JSON.stringify(d.productSet.product, null, 1))
