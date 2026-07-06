/**
 * Atualiza o PREÇO dos produtos no Bling a partir do preço atual do Mercado Livre
 * (mcp-meli/out/catalogo.json, campo `preco`). Casa por `codigo` (= SKU do ML).
 *
 *   npx tsx src/scripts/set-precos.ts --dry   # mostra tabela atual→novo, NÃO escreve
 *   npx tsx src/scripts/set-precos.ts         # grava preço
 *
 * SEGURANÇA:
 *  - envia SÓ { preco } no update → Bling v3 faz merge por campo, não toca
 *    tributacao(ncm/origem/cest) nem dimensões/gtin (provado pelo set-ncm).
 *  - GUARDA no 1º produto: lê ncm+origem antes/depois; ABORTA se qualquer um mudar.
 *  - SKU sem produto no Bling é pulado (não cria). Item sem SKU real (codigo=MLB) ignorado.
 *  - preço só é gravado se diferente do atual (evita PUT desnecessário).
 *  - vários anúncios mesmo SKU → usa o MAIOR preço (não vende barato demais).
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { findProdutoByCodigo, getProduto, updateProduto } from '../api/produtos.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CATALOGO = join(__dirname, '..', '..', '..', 'mcp-meli', 'out', 'catalogo.json')
const dry = process.argv.includes('--dry')

interface ItemMeli {
  titulo: string
  sku: string | null
  skuEhMlb: boolean
  preco?: number
  status?: string
  estoqueRef?: number
}

function tribDe(p: unknown): { ncm?: string; origem?: string } {
  const t = (p as { tributacao?: { ncm?: unknown; origem?: unknown } } | null)?.tributacao
  return {
    ncm: t?.ncm != null ? String(t.ncm) : undefined,
    origem: t?.origem != null ? String(t.origem) : undefined,
  }
}

async function main() {
  const raw = JSON.parse(readFileSync(CATALOGO, 'utf8'))
  const itens: ItemMeli[] = Array.isArray(raw) ? raw : raw.itens ?? raw.items ?? raw.data ?? []

  // Map codigo -> preço do anúncio PRINCIPAL (ativo de maior estoque). Evita pegar
  // preço de um kit/pausado do mesmo SKU. Fallback: ativo qualquer → qualquer.
  // Guarda o candidato vencedor: [preço, rank, estoque]. rank 2=ativo,1=outro.
  const best = new Map<string, { preco: number; rank: number; est: number }>()
  for (const i of itens) {
    if (!i.sku || i.skuEhMlb) continue
    const p = Number(i.preco) || 0
    if (p <= 0) continue
    const rank = i.status === 'active' ? 2 : 1
    const est = Number(i.estoqueRef) || 0
    const cur = best.get(i.sku)
    // vence: maior rank; empate rank → maior estoque; empate estoque → maior preço
    if (!cur || rank > cur.rank || (rank === cur.rank && (est > cur.est || (est === cur.est && p > cur.preco)))) {
      best.set(i.sku, { preco: p, rank, est })
    }
  }
  const precoPorSku = new Map<string, number>([...best].map(([sku, b]) => [sku, b.preco]))

  const skus = [...precoPorSku.keys()]
  console.log(`📊 ${skus.length} SKUs com preço no catálogo ML.`)

  let ok = 0, iguais = 0, semProduto = 0, erros = 0
  let idx = 0
  for (const sku of skus) {
    const novo = precoPorSku.get(sku)!
    let prod
    try {
      prod = await findProdutoByCodigo(sku)
    } catch (e) {
      erros++; console.log(`   ⚠️ ${sku}: erro busca (${e instanceof Error ? e.message : e})`); continue
    }
    if (!prod?.id) { semProduto++; continue }
    const atual = Number(prod.preco) || 0
    if (Math.abs(atual - novo) < 0.005) { iguais++; continue }

    if (dry) {
      console.log(`   ${sku.padEnd(28).slice(0, 28)} R$${atual.toFixed(2).padStart(9)} → R$${novo.toFixed(2)}`)
      ok++; idx++; continue
    }

    // GUARDA no primeiro update real
    if (idx === 0) {
      const antes = tribDe(await getProduto(prod.id))
      await updateProduto(prod.id, { preco: novo })
      const depois = tribDe(await getProduto(prod.id))
      if ((antes.ncm && antes.ncm !== depois.ncm) || (antes.origem && antes.origem !== depois.origem)) {
        console.error(`\n❌ ABORTADO: PUT alterou fiscal em ${sku}. ncm ${antes.ncm}→${depois.ncm}, origem ${antes.origem}→${depois.origem}. Nada mais gravado.`)
        process.exit(1)
      }
      console.log(`   🔬 ${sku}: R$${atual.toFixed(2)}→R$${novo.toFixed(2)} (ncm/origem preservados: ncm=${depois.ncm ?? '∅'} origem=${depois.origem ?? '∅'})`)
      ok++; idx++; continue
    }

    try {
      await updateProduto(prod.id, { preco: novo })
      ok++
    } catch (e) {
      erros++; console.log(`   ⚠️ ${sku}: erro update (${e instanceof Error ? e.message : e})`)
    }
    idx++
  }

  console.log(`\n${dry ? '🧪 DRY — ' : '✅ '}${ok} preços ${dry ? 'a atualizar' : 'gravados'} | ${iguais} já iguais | ${semProduto} sem produto no Bling | ${erros} erros.`)
}

main().catch((e) => { console.error('FALHA:', e); process.exit(1) })
