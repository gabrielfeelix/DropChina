/** READ-ONLY: confere o NCM gravado nos SKUs passados. npx tsx src/scripts/verifica-ncm.ts "SKU" "SKU" */
import { findProdutoByCodigo, getProduto } from '../api/produtos.js'

for (const sku of process.argv.slice(2)) {
  const p = await findProdutoByCodigo(sku)
  if (!p?.id) {
    console.log(`  "${sku}" → não achado`)
    continue
  }
  const d: any = await getProduto(p.id)
  console.log(`  "${sku}" → ncm ${d?.tributacao?.ncm ?? '—'} | origem ${d?.tributacao?.origem ?? '—'}`)
}
