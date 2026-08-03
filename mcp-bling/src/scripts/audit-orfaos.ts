/**
 * READ-ONLY: para cada produto Shopify "sem SKU no Bling", checa se ainda existe
 * VÍNCULO multiloja apontando pra ele. Se existe, não é órfão — é SKU renomeado
 * no Bling e o vínculo (que casa por ID, não por SKU) continua de pé.
 *
 *   npx tsx src/scripts/audit-orfaos.ts 9380925341915 9380926456027 ...
 */
import { withBling } from '../api/client.js'

const ID_LOJA = 206107628
const alvos = process.argv.slice(2)
if (!alvos.length) throw new Error('passe os IDs Shopify')

const vinculos: any[] = []
for (let pagina = 1; pagina <= 10; pagina++) {
  const res: any = await withBling((b) => b.produtosLojas.get({ idLoja: ID_LOJA, pagina, limite: 100 } as any))
  const data: any[] = res?.data ?? []
  vinculos.push(...data)
  if (data.length < 100) break
}

for (const idShopify of alvos) {
  const v = vinculos.find((x: any) => String(x.codigo) === String(idShopify))
  if (!v) {
    console.log(`\nShopify ${idShopify} → SEM VÍNCULO no Bling (órfão de verdade)`)
    continue
  }
  const res: any = await withBling((b) => b.produtos.find({ idProduto: v.produto.id } as any))
  const p = res?.data ?? {}
  console.log(
    `\nShopify ${idShopify} → VINCULADO ao Bling ${v.produto.id}` +
      `\n   SKU atual no Bling : "${p.codigo}"` +
      `\n   nome               : ${p.nome}` +
      `\n   preço produto      : ${p.preco} | preço vínculo: ${v.preco} | estoque: ${p.estoque?.saldoVirtualTotal}`,
  )
}
console.log('')
