/** Descartável: lista o que cai em cada criterio do produtos.get. */
import { withBling } from '../api/client.js'

for (const criterio of [3, 4]) {
  const res: any = await withBling((b) => b.produtos.get({ criterio, pagina: 1, limite: 100 } as any))
  console.log(`\n### criterio ${criterio} (${(res?.data ?? []).length})`)
  for (const p of res?.data ?? []) console.log(`  "${p.codigo}" | situacao:${p.situacao} | ${p.nome.slice(0, 60)}`)
}

// diferença entre criterio 5 (164) e o default (154)
const todos = new Map<number, any>()
for (let pagina = 1; pagina <= 5; pagina++) {
  const res: any = await withBling((b) => b.produtos.get({ criterio: 5, pagina, limite: 100 } as any))
  for (const p of res?.data ?? []) todos.set(p.id, p)
  if ((res?.data ?? []).length < 100) break
}
const padrao = new Set<number>()
for (let pagina = 1; pagina <= 5; pagina++) {
  const res: any = await withBling((b) => b.produtos.get({ pagina, limite: 100 } as any))
  for (const p of res?.data ?? []) padrao.add(p.id)
  if ((res?.data ?? []).length < 100) break
}
console.log(`\n### EM criterio 5 MAS FORA DO PADRÃO (${[...todos.keys()].filter((id) => !padrao.has(id)).length})`)
for (const id of [...todos.keys()].filter((i) => !padrao.has(i))) {
  const p = todos.get(id)
  console.log(`  "${p.codigo}" | situacao:${p.situacao} | ${p.nome.slice(0, 60)}`)
}
console.log('')
