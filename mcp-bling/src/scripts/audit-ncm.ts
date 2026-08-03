/**
 * Audita quais produtos do Bling estão sem NCM.
 *
 * A listagem (`produtos.get`) não devolve `tributacao`, então é preciso buscar o
 * detalhe de cada produto. ~160 produtos a ≤3 req/s → ~1 min.
 *
 * Escreve o resultado em JSON no caminho passado (default: ./ncm-audit.json):
 *   npm run audit:ncm -- /caminho/saida.json
 */
import { writeFileSync } from 'node:fs'
import { withBling } from '../api/client.js'
import { getProduto } from '../api/produtos.js'

interface Linha {
  id: number
  sku: string
  nome: string
  situacao?: string
  tipo?: string
  formato?: string
  preco?: number
  ncm: string | null
  cest: string | null
  origem: string | null
}

const out = process.argv[2] ?? 'ncm-audit.json'

async function listarTodos() {
  const todos: { id: number; nome: string; codigo?: string; situacao?: string; tipo?: string; formato?: string; preco?: number }[] = []
  for (let pagina = 1; ; pagina++) {
    const res = await withBling((b) => b.produtos.get({ pagina, limite: 100 } as any))
    const page = (res.data ?? []) as typeof todos
    todos.push(...page)
    console.log(`   página ${pagina}: ${page.length} (acumulado ${todos.length})`)
    if (page.length < 100) break
  }
  return todos
}

async function main() {
  console.log('📥 listando produtos do Bling…')
  const lista = await listarTodos()

  console.log(`\n🔎 buscando tributação de ${lista.length} produtos…`)
  const linhas: Linha[] = []
  for (let i = 0; i < lista.length; i++) {
    const p = lista[i]
    const det = (await getProduto(p.id)) as {
      tributacao?: { ncm?: unknown; cest?: unknown; origem?: unknown }
    }
    const trib = det?.tributacao ?? {}
    const norm = (v: unknown) => {
      const s = v == null ? '' : String(v).trim()
      return s === '' || s === '0' ? null : s
    }
    linhas.push({
      id: p.id,
      sku: p.codigo ?? '',
      nome: p.nome,
      situacao: p.situacao,
      tipo: p.tipo,
      formato: p.formato,
      preco: p.preco,
      ncm: norm(trib.ncm),
      cest: norm(trib.cest),
      origem: trib.origem == null ? null : String(trib.origem),
    })
    if ((i + 1) % 20 === 0) console.log(`   ${i + 1}/${lista.length}`)
  }

  const sem = linhas.filter((l) => !l.ncm)
  const com = linhas.filter((l) => l.ncm)
  writeFileSync(out, JSON.stringify({ total: linhas.length, comNcm: com.length, semNcm: sem.length, linhas }, null, 2))

  console.log(`\n📊 ${linhas.length} produtos | com NCM: ${com.length} | SEM NCM: ${sem.length}`)
  console.log(`\n❌ Sem NCM:`)
  sem.forEach((l) => console.log(`   ${l.situacao === 'A' ? '🟢' : '⚪'} ${l.sku.padEnd(28)} ${l.nome.slice(0, 70)}`))
  console.log(`\n💾 ${out}`)
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
