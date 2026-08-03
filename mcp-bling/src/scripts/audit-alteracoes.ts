/**
 * READ-ONLY: o que o Augusto mexeu no Bling a partir de uma data.
 * Usa os filtros dataAlteracao / dataInclusao da API v3 e cruza o preço com o
 * snapshot de 13/jul (catalogo/bling-vinculo-import.csv) pra mostrar o delta.
 *
 *   npx tsx src/scripts/audit-alteracoes.ts 2026-07-31
 */
import { readFileSync } from 'node:fs'
import { withBling } from '../api/client.js'

// ⚠️ A API v3 só honra os filtros de data com o PAR inicial+final. Passando só o
// inicial ela devolve o catálogo inteiro, silenciosamente.
const desde = process.argv[2] ?? '2026-07-31'
const ate = process.argv[3] ?? '2026-08-03'

async function paginado(params: Record<string, unknown>) {
  const out: any[] = []
  for (let pagina = 1; pagina <= 10; pagina++) {
    const res: any = await withBling((b) => b.produtos.get({ ...params, pagina, limite: 100 } as any))
    const data: any[] = res?.data ?? []
    out.push(...data)
    if (data.length < 100) break
  }
  return out
}

const alterados = await paginado({ dataAlteracaoInicial: desde, dataAlteracaoFinal: ate })
const novos = await paginado({ dataInclusaoInicial: desde, dataInclusaoFinal: ate })
const idsNovos = new Set(novos.map((p) => p.id))

// snapshot 13/jul: SKU;ID_Bling;ID_Loja;Preco;Loja
const base = new Map<string, number>()
try {
  const csv = readFileSync('../catalogo/bling-vinculo-import.csv', 'utf8')
  for (const linha of csv.split('\n').slice(1)) {
    const [sku, , , preco] = linha.split(';')
    if (sku) base.set(sku.trim(), Number(preco))
  }
} catch {
  console.log('(snapshot de 13/jul não encontrado — sem comparação de preço)')
}

console.log(`\n=== MEXIDO NO BLING DESDE ${desde} ===`)
console.log(`alterados: ${alterados.length} · criados do zero: ${novos.length}\n`)

console.log(`### PRODUTOS NOVOS (${novos.length})`)
for (const p of novos) {
  console.log(`  "${p.codigo}" | R$ ${p.preco} | ${p.nome}`)
}

const editados = alterados.filter((p) => !idsNovos.has(p.id))
console.log(`\n### EDITADOS (${editados.length})`)
for (const p of editados) {
  const antes = base.get(p.codigo)
  const delta =
    antes == null
      ? '(sem baseline)'
      : antes === Number(p.preco)
        ? 'preço igual ao de 13/jul'
        : `PREÇO ${antes} → ${p.preco}`
  console.log(`  "${p.codigo}" | ${delta} | ${p.nome.slice(0, 70)}`)
}

// SKUs que existiam em 13/jul e sumiram do Bling
const skusHoje = new Set((await paginado({})).map((p: any) => p.codigo))
const sumiram = [...base.keys()].filter((s) => !skusHoje.has(s))
console.log(`\n### SUMIRAM DO BLING desde 13/jul (${sumiram.length})`)
sumiram.forEach((s) => console.log(`  "${s}"`))
console.log('')
