/**
 * DESCOBERTA (read-only) de kits/combos no catálogo, pra planejar variação
 * composta no Bling. NÃO escreve nada. Classifica cada item em:
 *   - UNIT   : produto unitário (não-kit) — candidato a componente
 *   - KIT-N  : kit de N unidades do MESMO item (vira composição: 1 kit = N × unit)
 *   - COMBO  : junta itens DIFERENTES (teclado+mouse...) — composição multi-componente
 *   - PACK?  : "pacote"/"folhas" onde o unitário talvez não exista separado — revisar
 *
 * Pra cada KIT, tenta sugerir o produto UNIT candidato por token de modelo
 * compartilhado (ex.: "1105", "tn1060", "667"). Sugestão é PALPITE — revisar.
 *
 *   npm run discover:kits
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CATALOGO = join(__dirname, '..', '..', '..', 'mcp-meli', 'out', 'catalogo.json')

interface Item {
  sku: string | null
  skuEhMlb: boolean
  titulo: string
  estoqueRef?: number
}

const KIT_RE = /\bkit\b|\bcombo\b|\bpacote\b|\bpct\b|\bpça?s?\b|\bpe[çc]as\b|\b\d+\s*(?:x|un|unidades|folhas|fls|toner|toners|saco|sacos)\b/i
const COMBO_RE = /combo|teclado.*mouse|mouse.*teclado|4x1|3x1|gamer (kit|combo)|kit gamer/i

/** Extrai multiplicador N do título/sku (ex.: "kit com 10", "5x", "3 toner", "200 folhas"). */
function multiplicador(t: string): number | null {
  const pats = [
    /kit\s*(?:com|de|c\/)?\s*(\d+)/i,
    /(\d+)\s*x\b/i,
    /(\d+)\s*(?:toners?|cartuchos?|un|unidades|folhas|fls|pe[çc]as|sacos?|pacotes?)/i,
    /\bcom\s*(\d+)\b/i,
  ]
  for (const p of pats) {
    const m = t.match(p)
    if (m) { const n = parseInt(m[1], 10); if (n > 1 && n <= 1000) return n }
  }
  return null
}

/** Tokens de modelo: alfanum com dígito (1105, w1105a, tn1060, 667, d111, 285a...). */
function tokensModelo(t: string): string[] {
  const toks = (t.toLowerCase().match(/[a-z]*\d[a-z0-9]*/g) ?? [])
    .filter((x) => x.length >= 3 && /\d/.test(x) && !/^\d{1,2}$/.test(x) && !/^(127|220|110|240|100v|3d|2ml|1k)$/.test(x))
  return [...new Set(toks)]
}

function main() {
  const itens = (JSON.parse(readFileSync(CATALOGO, 'utf8')) as Item[]).filter((i) => i.sku && !i.skuEhMlb)

  const units: Item[] = []
  const kits: { it: Item; n: number | null; tipo: string }[] = []
  for (const i of itens) {
    const isCombo = COMBO_RE.test(i.titulo)
    const isKit = KIT_RE.test(i.titulo) || KIT_RE.test(i.sku!)
    if (isCombo) kits.push({ it: i, n: multiplicador(i.titulo), tipo: 'COMBO' })
    else if (isKit) kits.push({ it: i, n: multiplicador(i.titulo), tipo: multiplicador(i.titulo) ? 'KIT-N' : 'PACK?' })
    else units.push(i)
  }

  console.log(`\n📦 ${itens.length} produtos. ${units.length} UNIT, ${kits.length} kit/combo/pack.\n`)
  console.log('=== KITS / COMBOS / PACKS (revisar) ===')
  console.log('tipo    N    sku                          estoq  título                                    → unit candidato')
  for (const { it, n, tipo } of kits.sort((a, b) => a.tipo.localeCompare(b.tipo))) {
    let sugestao = ''
    if (tipo === 'KIT-N') {
      const toks = tokensModelo(it.titulo)
      const cand = units.filter((u) => {
        const ut = u.titulo.toLowerCase() + ' ' + u.sku!.toLowerCase()
        return toks.some((tk) => ut.includes(tk))
      })
      sugestao = cand.length
        ? '→ ' + cand.slice(0, 3).map((c) => c.sku).join(' | ') + (cand.length > 3 ? ` (+${cand.length - 3})` : '')
        : '→ (nenhum unit casou — revisar)'
    }
    console.log(
      `${tipo.padEnd(7)} ${String(n ?? '?').padStart(2)}  ${it.sku!.padEnd(28)} ${String(it.estoqueRef ?? 0).padStart(4)}  ${it.titulo.slice(0, 40).padEnd(40)} ${sugestao}`,
    )
  }
  console.log('')
}

main()
