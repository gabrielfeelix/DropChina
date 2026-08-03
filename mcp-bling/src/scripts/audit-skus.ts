/**
 * Audit READ-ONLY dos SKUs do Bling. Não escreve nada.
 * Sinaliza codigo com cara de texto livre (espaço, muito longo, minúsculo),
 * duplicado ou vazio — o que quebra o vínculo com Shopify/ML.
 *
 *   npx tsx src/scripts/audit-skus.ts
 */
import { withBling } from '../api/client.js'

interface P {
  id?: number
  nome?: string
  codigo?: string
  preco?: number
  situacao?: string
  gtin?: string
  tributacao?: { ncm?: string }
}

const todos: P[] = []
for (let pagina = 1; pagina <= 10; pagina++) {
  const res: any = await withBling((b) => b.produtos.get({ pagina, limite: 100 } as any))
  const data: P[] = res?.data ?? []
  todos.push(...data)
  if (data.length < 100) break
}

console.log(`\n=== ${todos.length} produtos no Bling ===\n`)

const suspeito = (c?: string) =>
  !c ? 'VAZIO' : /\s/.test(c) ? 'TEM ESPAÇO' : c.length > 25 ? 'MUITO LONGO' : null

const quebrados = todos.filter((p) => suspeito(p.codigo))
console.log(`### CÓDIGO/SKU SUSPEITO (${quebrados.length})`)
for (const p of quebrados) {
  console.log(`  [${suspeito(p.codigo)}] id:${p.id} codigo:"${p.codigo ?? ''}" | ${p.nome}`)
}

const porCodigo = new Map<string, P[]>()
for (const p of todos) {
  const c = (p.codigo ?? '').trim()
  if (!c) continue
  porCodigo.set(c, [...(porCodigo.get(c) ?? []), p])
}
const dups = [...porCodigo.entries()].filter(([, v]) => v.length > 1)
console.log(`\n### SKU DUPLICADO (${dups.length})`)
for (const [c, v] of dups) console.log(`  "${c}" → ${v.map((p) => `${p.id}:${p.nome}`).join(' | ')}`)

console.log('\n### PAPEL / TONER (o que o Augusto mexeu)')
for (const p of todos) {
  const n = (p.nome ?? '').toLowerCase()
  if (!/papel|toner|cartucho|tinta/.test(n)) continue
  console.log(
    `  id:${p.id} | codigo:"${p.codigo ?? ''}" | preco:${p.preco} | ncm:${p.tributacao?.ncm ?? '—'} | sit:${p.situacao} | ${p.nome}`,
  )
}

console.log(`\n### PREÇO ZERADO (${todos.filter((p) => !p.preco).length})`)
for (const p of todos.filter((p) => !p.preco)) console.log(`  id:${p.id} "${p.codigo}" | ${p.nome}`)

console.log('')
