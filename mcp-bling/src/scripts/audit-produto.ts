/**
 * Detalhe READ-ONLY de produtos por id. Mostra o que a lista não traz
 * (tributacao/NCM, imagens, estoque, dataAlteracao).
 *
 *   npx tsx src/scripts/audit-produto.ts 16659520229 16659520187
 */
import { withBling } from '../api/client.js'

const ids = process.argv.slice(2).map(Number).filter(Boolean)
if (!ids.length) throw new Error('passe ao menos um id')

for (const id of ids) {
  const res: any = await withBling((b) => b.produtos.find({ idProduto: id } as any))
  const p = res?.data ?? {}
  console.log(`\n=== id ${id} — ${p.nome}`)
  console.log(`  codigo   : "${p.codigo ?? ''}"`)
  console.log(`  preco    : ${p.preco}  | precoCusto: ${p.precoCusto ?? '—'}`)
  console.log(`  situacao : ${p.situacao} | formato: ${p.formato} | tipo: ${p.tipo}`)
  console.log(`  ncm      : ${p.tributacao?.ncm ?? '—'} | origem: ${p.tributacao?.origem ?? '—'} | cest: ${p.tributacao?.cest ?? '—'}`)
  console.log(`  gtin     : ${p.gtin ?? '—'} | marca: ${p.marca ?? '—'}`)
  console.log(`  peso     : bruto ${p.pesoBruto ?? '—'} / liq ${p.pesoLiquido ?? '—'}`)
  console.log(`  estoque  : ${JSON.stringify(p.estoque ?? {})}`)
  const ext = p.midia?.imagens?.externas ?? []
  const int = p.midia?.imagens?.internas ?? []
  console.log(`  imagens  : externas ${ext.length} | internas ${int.length}`)
  ext.slice(0, 3).forEach((i: any) => console.log(`     ext: ${i.link}`))
  int.slice(0, 3).forEach((i: any) => console.log(`     int: ${i.link ?? i.nome}`))
  console.log(`  keys     : ${Object.keys(p).join(', ')}`)
}
console.log('')
