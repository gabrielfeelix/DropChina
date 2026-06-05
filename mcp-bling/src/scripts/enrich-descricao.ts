/**
 * Enriquece a descrição complementar dos produtos: descrição original do ML +
 * bloco "Especificações" montado da ficha técnica REAL do ML (sem inventar).
 * Pros que não têm descrição, monta a partir do título + ficha.
 * Idempotente: reconstrói sempre a partir do catalogo.json (não duplica blocos).
 *
 *   npm run enrich:descricao -- --dry
 *   npm run enrich:descricao
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { findProdutoByCodigo, updateProduto } from '../api/produtos.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CATALOGO = join(__dirname, '..', '..', '..', 'mcp-meli', 'out', 'catalogo.json')
const dry = process.argv.includes('--dry')

interface Item {
  titulo: string
  sku: string | null
  skuEhMlb: boolean
  descricao?: string
  atributos?: { nome: string; valor: string }[]
}

const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function montarDescricao(i: Item): string {
  const partes: string[] = []
  if (i.descricao && i.descricao.trim()) {
    partes.push(`<p>${esc(i.descricao.trim()).replace(/\r?\n+/g, '<br>')}</p>`)
  } else {
    partes.push(`<p>${esc(i.titulo)}</p>`)
  }
  // ficha técnica: dedupe por valor, ignora vazios
  const vistos = new Set<string>()
  const linhas: string[] = []
  for (const a of i.atributos ?? []) {
    const v = (a.valor ?? '').trim()
    const nome = (a.nome ?? '').trim()
    if (!v || !nome) continue
    const key = v.toLowerCase()
    if (vistos.has(key)) continue
    vistos.add(key)
    linhas.push(`<li><strong>${esc(nome)}:</strong> ${esc(v)}</li>`)
  }
  if (linhas.length) {
    partes.push(`<p><strong>Especificações</strong></p><ul>${linhas.join('')}</ul>`)
  }
  return partes.join('')
}

async function main() {
  const itens = (JSON.parse(readFileSync(CATALOGO, 'utf8')) as Item[]).filter((i) => i.sku && !i.skuEhMlb)
  console.log(`\n📝 ${itens.length} produtos com SKU.`)
  if (dry) console.log('🧪 DRY RUN — nada será escrito.')

  if (dry) {
    const ex = itens.find((i) => (i.atributos?.length ?? 0) > 6)!
    console.log(`\n--- amostra (${ex.sku}) ---\n${montarDescricao(ex).slice(0, 700)}...\n`)
    const semDesc = itens.filter((i) => !i.descricao).length
    console.log(`Reconstruiria ${itens.length} descrições (${semDesc} hoje sem descrição ganham uma da ficha).`)
    return
  }

  let ok = 0
  let erros = 0
  for (const i of itens) {
    try {
      const p = await findProdutoByCodigo(i.sku!)
      if (!p?.id) { erros++; continue }
      await updateProduto(p.id, { descricaoComplementar: montarDescricao(i) })
      ok++
    } catch (err) {
      erros++
      console.error(`   ❌ ${i.sku}: ${err instanceof Error ? err.message : err}`)
    }
  }
  console.log(`\n✅ ${ok} descrições enriquecidas, ${erros} erros.\n`)
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
