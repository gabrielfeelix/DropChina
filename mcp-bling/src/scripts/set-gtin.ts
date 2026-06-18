/**
 * Grava GTIN nos produtos do Bling a partir de gtin-map.json.
 * Mapa: { "<sku>": { gtin, confidence, source } }.
 *
 * Garantias:
 *  - valida checksum GTIN-8/12/13/14 (mod-10); inválido é RECUSADO.
 *  - só grava entradas confidence === "HIGH" (resto é pra conferência humana).
 *  - updateProduto é PUT; testa tributacao.origem antes/depois no 1º e ABORTA se zerar.
 *  - não toca em nenhum outro campo.
 *
 *   npm run set:gtin -- --dry    # mostra o que faria
 *   npm run set:gtin             # grava os HIGH válidos
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { findProdutoByCodigo, getProduto, updateProduto } from '../api/produtos.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MAP = join(__dirname, 'gtin-map.json')
const dry = process.argv.includes('--dry')

interface Entry {
  gtin: string
  confidence: 'HIGH' | 'MED' | 'LOW'
  source?: string
}

function validGtin(raw: string): boolean {
  const s = String(raw).replace(/\D/g, '')
  if (![8, 12, 13, 14].includes(s.length)) return false
  const dg = s.split('').map(Number)
  const chk = dg.pop()!
  let sum = 0
  dg.reverse().forEach((n, i) => (sum += n * (i % 2 === 0 ? 3 : 1)))
  return (10 - (sum % 10)) % 10 === chk
}

function origemDe(p: unknown): string | undefined {
  const trib = (p as { tributacao?: { origem?: unknown } } | null)?.tributacao
  return trib?.origem != null ? String(trib.origem) : undefined
}

async function main() {
  const map = JSON.parse(readFileSync(MAP, 'utf8')) as Record<string, Entry>
  const entries = Object.entries(map)
  const high = entries.filter(([, e]) => e.confidence === 'HIGH' && validGtin(e.gtin))
  const invalid = entries.filter(([, e]) => !validGtin(e.gtin))
  const naoHigh = entries.filter(([, e]) => e.confidence !== 'HIGH' && validGtin(e.gtin))

  console.log(`📊 mapa: ${entries.length} | HIGH válido: ${high.length} | não-HIGH: ${naoHigh.length} | checksum inválido: ${invalid.length}`)
  if (invalid.length) {
    console.log('\n⛔ GTIN com checksum INVÁLIDO (não grava):')
    invalid.forEach(([sku, e]) => console.log(`   ${sku} → ${e.gtin}`))
  }
  if (naoHigh.length) {
    console.log('\n🟡 não-HIGH (pular, conferir na caixa):')
    naoHigh.forEach(([sku, e]) => console.log(`   ${sku} → ${e.gtin} [${e.confidence}]`))
  }

  if (dry) {
    console.log('\n🧪 DRY — gravaria estes HIGH:')
    high.forEach(([sku, e]) => console.log(`   ${sku} → ${e.gtin}`))
    return
  }

  let ok = 0
  let semProduto = 0
  for (let idx = 0; idx < high.length; idx++) {
    const [sku, e] = high[idx]
    const p = await findProdutoByCodigo(sku)
    if (!p?.id) {
      console.log(`   ⚠️ ${sku}: não achado no Bling — pulado.`)
      semProduto++
      continue
    }
    if (idx === 0) {
      const antes = origemDe(await getProduto(p.id))
      await updateProduto(p.id, { gtin: e.gtin })
      const depois = origemDe(await getProduto(p.id))
      console.log(`   🔬 ${sku}: origem antes=${antes ?? '∅'} depois=${depois ?? '∅'}`)
      if (antes && antes !== depois) {
        console.error(`\n❌ ABORTADO: PUT zerou origem (${antes}→${depois}). Nada mais gravado.`)
        process.exit(1)
      }
      ok++
      console.log(`   ✅ ${sku} → ${e.gtin} (origem preservada)`)
      continue
    }
    await updateProduto(p.id, { gtin: e.gtin })
    ok++
    console.log(`   ✅ ${sku} → ${e.gtin}`)
  }
  console.log(`\n✅ Feito: ${ok} GTIN gravados, ${semProduto} sem produto.`)
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
