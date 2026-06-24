/**
 * Grava NCM nos produtos do Bling a partir de ncm-map.json.
 * Mapa: { "<sku>": { ncm, confidence, basis, ... } } (gerado do cruzamento
 * planilha do contador × catálogo; campos extras _t/_cat/basis são ignorados aqui).
 *
 * Garantias:
 *  - valida formato NCM (8 dígitos); inválido/null é RECUSADO.
 *  - só grava confidence === "HIGH". MED/FLAG são pra revisão humana/contador.
 *  - updateProduto é PUT; testa tributacao.origem antes/depois no 1º e ABORTA se zerar.
 *  - grava só tributacao.ncm; não toca em origem/cest/outros campos.
 *
 *   npm run set:ncm -- --dry    # mostra o que faria (revisar antes!)
 *   npm run set:ncm             # grava os HIGH válidos
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { findProdutoByCodigo, getProduto, updateProduto } from '../api/produtos.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MAP = join(__dirname, 'ncm-map.json')
const dry = process.argv.includes('--dry')

interface Entry {
  ncm: string | null
  confidence: 'HIGH' | 'MED' | 'FLAG'
  basis?: string
}

const validNcm = (n: string | null): n is string => !!n && /^\d{8}$/.test(String(n).replace(/\D/g, '')) && String(n).replace(/\D/g, '').length === 8

function origemDe(p: unknown): string | undefined {
  const trib = (p as { tributacao?: { origem?: unknown } } | null)?.tributacao
  return trib?.origem != null ? String(trib.origem) : undefined
}

async function main() {
  const map = JSON.parse(readFileSync(MAP, 'utf8')) as Record<string, Entry>
  const entries = Object.entries(map)
  const high = entries.filter(([, e]) => e.confidence === 'HIGH' && validNcm(e.ncm))
  const med = entries.filter(([, e]) => e.confidence === 'MED')
  const flag = entries.filter(([, e]) => e.confidence === 'FLAG')
  const invalid = entries.filter(([, e]) => e.confidence === 'HIGH' && !validNcm(e.ncm))

  console.log(`📊 ${entries.length} SKUs | HIGH válido: ${high.length} | MED: ${med.length} | FLAG: ${flag.length}` + (invalid.length ? ` | HIGH inválido: ${invalid.length}` : ''))

  if (dry) {
    const byNcm: Record<string, number> = {}
    high.forEach(([, e]) => (byNcm[e.ncm!] = (byNcm[e.ncm!] || 0) + 1))
    console.log('\n🧪 DRY — gravaria HIGH (por NCM):')
    Object.entries(byNcm).sort((a, b) => b[1] - a[1]).forEach(([n, c]) => console.log(`   ${String(c).padStart(3)} → ${n}`))
    console.log(`\n🟡 ${med.length} MED + ⛔ ${flag.length} FLAG ficam de fora (revisar/contador).`)
    return
  }

  let ok = 0
  let semProduto = 0
  for (let idx = 0; idx < high.length; idx++) {
    const [sku, e] = high[idx]
    const ncm = String(e.ncm).replace(/\D/g, '')
    const p = await findProdutoByCodigo(sku)
    if (!p?.id) {
      console.log(`   ⚠️ ${sku}: não achado no Bling — pulado.`)
      semProduto++
      continue
    }
    if (idx === 0) {
      const antes = origemDe(await getProduto(p.id))
      await updateProduto(p.id, { ncm })
      const depois = origemDe(await getProduto(p.id))
      console.log(`   🔬 ${sku}: origem antes=${antes ?? '∅'} depois=${depois ?? '∅'}`)
      if (antes && antes !== depois) {
        console.error(`\n❌ ABORTADO: PUT zerou origem (${antes}→${depois}). Nada mais gravado.`)
        process.exit(1)
      }
      ok++
      console.log(`   ✅ ${sku} → NCM ${ncm} (origem preservada)`)
      continue
    }
    await updateProduto(p.id, { ncm })
    ok++
    console.log(`   ✅ ${sku} → NCM ${ncm}`)
  }
  console.log(`\n✅ Feito: ${ok} NCM gravados, ${semProduto} sem produto.`)
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
