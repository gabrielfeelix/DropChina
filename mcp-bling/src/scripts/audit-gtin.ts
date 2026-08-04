/** READ-ONLY: quantos produtos ativos têm GTIN. Merchant Center depende disso. */
import { withBling } from '../api/client.js'
import { getProduto } from '../api/produtos.js'

const lista: any[] = []
for (let pagina = 1; pagina <= 10; pagina++) {
  const res: any = await withBling((b) => b.produtos.get({ pagina, limite: 100 } as any))
  const data: any[] = res?.data ?? []
  lista.push(...data)
  if (data.length < 100) break
}

let com = 0
const sem: string[] = []
for (const p of lista) {
  const d: any = await getProduto(p.id)
  const g = String(d?.gtin ?? '').trim()
  if (g && g.toUpperCase() !== 'SEM GTIN') com++
  else sem.push(`${p.codigo} | ${p.nome?.slice(0, 55)}`)
}

console.log(`\nRESULTADO: ${com}/${lista.length} com GTIN · ${sem.length} sem\n`)
sem.forEach((s) => console.log(`  ${s}`))
