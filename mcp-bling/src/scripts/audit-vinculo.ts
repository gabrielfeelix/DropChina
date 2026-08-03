/**
 * READ-ONLY: quantos produtos têm vínculo multiloja com a Shopify (idLoja 206107628).
 * É o vínculo que faz o Bling empurrar nome/preço pro canal.
 *
 *   npx tsx src/scripts/audit-vinculo.ts
 */
import { withBling } from '../api/client.js'

const ID_LOJA = 206107628

const vinculos: any[] = []
for (let pagina = 1; pagina <= 10; pagina++) {
  const res: any = await withBling((b) => b.produtosLojas.get({ idLoja: ID_LOJA, pagina, limite: 100 } as any))
  const data: any[] = res?.data ?? []
  vinculos.push(...data)
  if (data.length < 100) break
}

console.log(`\nVínculos multiloja com "Dropchina oficial" (idLoja ${ID_LOJA}): ${vinculos.length}\n`)
console.log('amostra:', JSON.stringify(vinculos.slice(0, 3), null, 2))

const alvos = ['tn660 DropChina', '1105 Premiun', 'ISD Full', 'papel 180g 20 saco de 50']
const idsAlvo = new Map<number, string>()
for (const codigo of alvos) {
  const res: any = await withBling((b) => b.produtos.get({ codigo, limite: 100 } as any))
  const p = (res?.data ?? []).find((x: any) => x.codigo === codigo)
  if (p) idsAlvo.set(p.id, codigo)
}

console.log('\n### VÍNCULO DOS DIVERGENTES')
for (const [id, codigo] of idsAlvo) {
  const v = vinculos.find((x: any) => (x.produto?.id ?? x.idProduto) === id)
  const res: any = await withBling((b) => b.produtos.find({ idProduto: id } as any))
  const precoProduto = res?.data?.preco
  console.log(
    `  "${codigo}" (id ${id}) → ${v ? `VINCULADO idLoja:${v.codigo}` : 'SEM VÍNCULO'} | preço PRODUTO: ${precoProduto} | preço VÍNCULO: ${v?.preco ?? '—'}`,
  )
}
console.log('')
