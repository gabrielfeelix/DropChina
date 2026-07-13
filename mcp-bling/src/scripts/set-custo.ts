/**
 * Grava o CUSTO (COGS) dos produtos no Bling a partir de `atributos-produtos.csv`
 * (colunas: CUSTO;IMPOSTO;SKU, sep=";", SKU = `codigo` do produto no Bling).
 *
 *   npx tsx src/scripts/set-custo.ts --dry   # só relatório de match, NÃO escreve
 *   npx tsx src/scripts/set-custo.ts         # grava custo
 *
 * COMO O BLING GUARDA CUSTO (v3):
 *   custo NÃO é campo do produto. O "Preço de custo" vem do FORNECEDOR PADRÃO
 *   (entidade produtosFornecedores, padrao=true). Então:
 *     1. garante 1 contato fornecedor genérico (codigo FORN-DROPCHINA);
 *     2. cria/atualiza produtosFornecedores {produto, fornecedor, precoCusto, padrao:true}.
 *
 * SEGURANÇA:
 *   - match EXATO normalizado (lower+trim+colapsa espaço). Sem fuzzy — custo errado é pior que vazio.
 *   - idempotente: se o produto já tem produtosFornecedores desse fornecedor, ATUALIZA (não duplica).
 *   - --dry não toca em nada (nem cria fornecedor).
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { withBling } from '../api/client.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSV = join(__dirname, '..', '..', '..', 'atributos-produtos.csv')
const dry = process.argv.includes('--dry')
const FORN_CODIGO = 'FORN-DROPCHINA'
const FORN_NOME = 'Fornecedor Padrão (DropChina)'

const norm = (s: string) => s.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim()

interface Row { custo: number; imposto: number; sku: string }

function lerCsv(): Row[] {
  const linhas = readFileSync(CSV, 'utf8').split(/\r?\n/).filter((l) => l.trim())
  const rows: Row[] = []
  for (const l of linhas.slice(1)) {
    const [custo, imposto, ...rest] = l.split(';')
    const sku = rest.join(';').trim()
    if (!sku) continue
    rows.push({ custo: Number(custo), imposto: Number(imposto), sku })
  }
  return rows
}

async function todosProdutos(): Promise<{ id: number; codigo: string; nome: string }[]> {
  const out: any[] = []
  for (let pg = 1; pg <= 4; pg++) {
    const r: any = await withBling((b) => b.produtos.get({ pagina: pg, limite: 100 } as any))
    const d = r.data ?? []
    out.push(...d)
    if (d.length < 100) break
  }
  return out.map((p) => ({ id: p.id, codigo: String(p.codigo ?? ''), nome: p.nome ?? '' }))
}

async function garantirFornecedor(): Promise<number> {
  const r: any = await withBling((b) => b.contatos.get({ pesquisa: FORN_CODIGO, limite: 100 } as any))
  const achado = (r.data ?? []).find((c: any) => c.codigo === FORN_CODIGO)
  if (achado?.id) { console.log(`   ↳ fornecedor existe [${achado.id}]`); return achado.id }
  const criado: any = await withBling((b) =>
    b.contatos.create({ nome: FORN_NOME, codigo: FORN_CODIGO, tipo: 'J', situacao: 'A' } as any),
  )
  const id = criado.data?.id
  console.log(`   ↳ fornecedor criado [${id}] ${FORN_NOME}`)
  return id
}

async function main() {
  const rows = lerCsv()
  const prods = await todosProdutos()
  console.log(`📄 CSV: ${rows.length} linhas | 📦 Bling: ${prods.length} produtos`)

  // index produto por codigo normalizado
  const porCod = new Map<string, { id: number; codigo: string; nome: string }>()
  for (const p of prods) porCod.set(norm(p.codigo), p)

  // resolve match. CSV pode ter SKU duplicado; fica o 1º.
  const matches: { row: Row; prod: { id: number; codigo: string; nome: string } }[] = []
  const semProd: Row[] = []
  const usados = new Set<number>()
  for (const row of rows) {
    const p = porCod.get(norm(row.sku))
    if (p && !usados.has(p.id)) { matches.push({ row, prod: p }); usados.add(p.id) }
    else if (!p) semProd.push(row)
  }
  const semCusto = prods.filter((p) => !usados.has(p.id))

  console.log(`\n✅ MATCH (${matches.length}):`)
  for (const m of matches)
    console.log(`   R$${m.row.custo.toFixed(2).padStart(9)}  ${m.prod.codigo.padEnd(30).slice(0, 30)} | ${m.prod.nome.slice(0, 40)}`)
  console.log(`\n❓ CSV sem produto no Bling (${semProd.length}): ${semProd.map((r) => r.sku).join(' · ')}`)
  console.log(`\n📭 Produtos Bling SEM custo no CSV (${semCusto.length}): ${semCusto.map((p) => p.codigo).join(' · ')}`)

  if (dry) { console.log(`\n🧪 DRY — nada gravado.`); return }

  console.log(`\n✍️  Gravando custo...`)
  const fornId = await garantirFornecedor()
  let ok = 0, upd = 0, iguais = 0, erros = 0
  for (const { row, prod } of matches) {
    try {
      // registros existentes do produto. O Bling mantém 1 placeholder fantasma
      // (fornecedor.id=0) que NÃO é updatable/deletable — ignorar. Só mexemos no
      // nosso (fornecedor.id=fornId): update se já existe, senão create.
      const ex: any = await withBling((b) => b.produtosFornecedores.get({ idProduto: prod.id } as any))
      const meu = (ex.data ?? []).find((r: any) => r.fornecedor?.id === fornId)
      if (meu?.id) {
        if (Math.abs(Number(meu.precoCusto) - row.custo) < 0.005) { iguais++; continue }
        await withBling((b) => b.produtosFornecedores.update({ idProdutoFornecedor: meu.id, descricao: prod.nome, precoCusto: row.custo, precoCompra: row.custo, padrao: true, produto: { id: prod.id }, fornecedor: { id: fornId } } as any))
        upd++
      } else {
        await withBling((b) => b.produtosFornecedores.create({ descricao: prod.nome, precoCusto: row.custo, precoCompra: row.custo, padrao: true, produto: { id: prod.id }, fornecedor: { id: fornId } } as any))
        ok++
      }
    } catch (e) {
      erros++; console.log(`   ⚠️ ${prod.codigo}: ${e instanceof Error ? e.message : e}`)
    }
  }
  console.log(`\n✅ ${ok} criados | ${upd} atualizados | ${iguais} já iguais | ${erros} erros.`)
}

main().catch((e) => { console.error('FALHA:', e); process.exit(1) })
