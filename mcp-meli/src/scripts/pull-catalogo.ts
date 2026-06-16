/**
 * Puxa o catálogo completo de anúncios do vendedor (READ-ONLY) e gera:
 *   out/catalogo.json   — todos os itens normalizados
 *   out/auditoria.md     — relatório de pendências (sem SKU, sem GTIN, categoria)
 *
 *   npm run pull
 *
 * NÃO escreve nada no ML nem no Bling. Só lê e salva local.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { getMyUserId, listAllItemIds, getItems, extractSku, attrValue, getItemDescription, type MlItemRaw } from '../api/items.js'
import { getCategory } from '../api/categories.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', '..', 'out')

interface ItemNormalizado {
  mlb: string
  titulo: string
  sku: string | null
  skuEhMlb: boolean
  marca: string | null
  gtin: string | null
  preco?: number
  estoqueRef?: number
  status?: string
  tipoAnuncio?: string
  /** logistic_type do ML; 'fulfillment' = FULL (estoque no galpão do ML). */
  logisticType?: string
  /** true se o anúncio é Mercado Livre FULL — ML controla o estoque, Bling NÃO deve sobrescrever. */
  full?: boolean
  categoriaId?: string
  categoriaNome?: string
  temVariacoes: boolean
  qtdFotos: number
  imagens: string[]
  // peso (kg) e dimensões (cm) — da embalagem do ML
  pesoBrutoKg?: number
  alturaCm?: number
  larguraCm?: number
  profundidadeCm?: number
  // atributos úteis p/ campos customizados
  modeloCompat?: string | null
  cor?: string | null
  rendimento?: number | null
  descricao?: string
  /** Ficha técnica completa do ML (nome amigável + valor). */
  atributos?: { nome: string; valor: string }[]
  permalink?: string
}

// atributos técnicos/redundantes que NÃO entram na ficha (já usados ou internos)
const ATTR_SKIP = new Set([
  'SELLER_SKU','GTIN','EMPTY_GTIN','PACKAGE_WEIGHT','PACKAGE_HEIGHT','PACKAGE_WIDTH','PACKAGE_LENGTH',
  'SELLER_PACKAGE_WEIGHT','SELLER_PACKAGE_HEIGHT','SELLER_PACKAGE_WIDTH','SELLER_PACKAGE_LENGTH',
  'PACKAGE_DATA_SOURCE','SYI_PYMES_ID','SHIPMENT_PACKING','TOTAL_CONTENT_WEIGHT','BRAND',
])
function fichaTecnica(i: MlItemRaw): { nome: string; valor: string }[] {
  return (i.attributes ?? [])
    .filter((a) => a.value_name && a.name && !ATTR_SKIP.has(a.id))
    .map((a) => ({ nome: a.name as string, valor: a.value_name as string }))
}

const attr = attrValue
function gtinDe(item: MlItemRaw): string | null {
  return attr(item, 'GTIN')
}
/** "2830 g" → 2.83 (kg); "18.1 cm" → 18.1. Pega o 1º número. */
function num(s: string | null): number | undefined {
  if (!s) return undefined
  const m = s.match(/[\d.,]+/)
  if (!m) return undefined
  return parseFloat(m[0].replace(',', '.'))
}

async function main() {
  console.log('🔎 Descobrindo user_id...')
  const userId = await getMyUserId()
  console.log(`   user_id: ${userId}`)

  console.log('📥 Listando ids dos anúncios (scan)...')
  const ids = await listAllItemIds(userId)
  console.log(`   ${ids.length} anúncios encontrados.`)

  console.log('📦 Puxando detalhes (multiget 20/req)...')
  const raw = await getItems(ids)
  console.log(`   ${raw.length} itens detalhados.`)

  // categorias únicas → nome
  const catIds = [...new Set(raw.map((i) => i.category_id).filter(Boolean) as string[])]
  const catNome = new Map<string, string>()
  for (const cid of catIds) {
    try {
      const c = await getCategory(cid)
      catNome.set(cid, c.path_from_root?.map((p) => p.name).join(' > ') ?? c.name)
    } catch {
      catNome.set(cid, '(erro ao ler categoria)')
    }
  }

  // descrições (endpoint separado, 1 GET por item)
  console.log('📝 Puxando descrições...')
  const desc = new Map<string, string>()
  for (const i of raw) desc.set(i.id, await getItemDescription(i.id))

  const pesoG = (i: MlItemRaw) => num(attr(i, 'PACKAGE_WEIGHT') ?? attr(i, 'SELLER_PACKAGE_WEIGHT'))
  const itens: ItemNormalizado[] = raw.map((i) => {
    const sku = extractSku(i)
    const pg = pesoG(i)
    return {
      mlb: i.id,
      titulo: i.title,
      sku,
      skuEhMlb: !sku || sku === i.id || /^MLB\d+$/.test(sku ?? ''),
      marca: attr(i, 'BRAND'),
      gtin: gtinDe(i),
      preco: i.price ?? i.base_price,
      estoqueRef: i.available_quantity,
      status: i.status,
      tipoAnuncio: i.listing_type_id,
      logisticType: i.shipping?.logistic_type,
      full: i.shipping?.logistic_type === 'fulfillment',
      categoriaId: i.category_id,
      categoriaNome: i.category_id ? catNome.get(i.category_id) : undefined,
      temVariacoes: (i.variations?.length ?? 0) > 0,
      qtdFotos: i.pictures?.length ?? 0,
      imagens: (i.pictures ?? []).map((p) => p.url).filter(Boolean),
      pesoBrutoKg: pg != null ? +(pg / 1000).toFixed(3) : undefined,
      alturaCm: num(attr(i, 'PACKAGE_HEIGHT') ?? attr(i, 'SELLER_PACKAGE_HEIGHT')),
      larguraCm: num(attr(i, 'PACKAGE_WIDTH') ?? attr(i, 'SELLER_PACKAGE_WIDTH')),
      profundidadeCm: num(attr(i, 'PACKAGE_LENGTH') ?? attr(i, 'SELLER_PACKAGE_LENGTH')),
      modeloCompat: attr(i, 'DETAILED_MODEL') ?? attr(i, 'MODEL'),
      cor: attr(i, 'INK_COLOR') ?? attr(i, 'COLOR'),
      rendimento: num(attr(i, 'PAGE_YIELD')) ?? null,
      descricao: desc.get(i.id) || undefined,
      atributos: fichaTecnica(i),
      permalink: i.permalink,
    }
  })

  mkdirSync(OUT, { recursive: true })
  writeFileSync(join(OUT, 'catalogo.json'), JSON.stringify(itens, null, 2))

  // auditoria
  const semSku = itens.filter((i) => i.skuEhMlb)
  const semGtin = raw.filter((i) => !gtinDe(i))
  const semCategoria = itens.filter((i) => !i.categoriaId)
  const semFoto = itens.filter((i) => i.qtdFotos === 0)
  const porCategoria = new Map<string, number>()
  itens.forEach((i) => {
    const k = i.categoriaNome ?? '(sem categoria)'
    porCategoria.set(k, (porCategoria.get(k) ?? 0) + 1)
  })

  const md = [
    '# Auditoria do catálogo Mercado Livre — DropChina',
    '',
    `Total de anúncios: **${itens.length}**`,
    '',
    '## Pendências',
    `- SKU ausente ou = MLB (vira bagunça no Bling): **${semSku.length}**`,
    `- Sem GTIN: **${semGtin.length}**`,
    `- Sem categoria: **${semCategoria.length}**`,
    `- Sem foto: **${semFoto.length}**`,
    `- Anúncios FULL (ML controla estoque — Bling NÃO deve sobrescrever): **${itens.filter((i) => i.full).length}**`,
    '',
    '## Anúncios por categoria',
    ...[...porCategoria.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `- ${k}: ${n}`),
    '',
    '## Top 30 sem SKU (corrigir antes do go-live)',
    ...semSku.slice(0, 30).map((i) => `- ${i.mlb} | ${i.titulo}`),
    '',
  ].join('\n')
  writeFileSync(join(OUT, 'auditoria.md'), md)

  console.log(`\n✅ Pronto.`)
  console.log(`   out/catalogo.json  (${itens.length} itens)`)
  console.log(`   out/auditoria.md`)
  console.log(`\n   Resumo: ${semSku.length} sem SKU, ${semGtin.length} sem GTIN, ${semCategoria.length} sem categoria.\n`)
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
