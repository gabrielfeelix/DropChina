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
import { getMyUserId, listAllItemIds, getItems, extractSku, type MlItemRaw } from '../api/items.js'
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
  categoriaId?: string
  categoriaNome?: string
  temVariacoes: boolean
  qtdFotos: number
  imagens: string[]
  permalink?: string
}

function attr(item: MlItemRaw, id: string): string | null {
  return item.attributes?.find((x) => x.id === id)?.value_name ?? null
}
function gtinDe(item: MlItemRaw): string | null {
  return attr(item, 'GTIN')
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

  const itens: ItemNormalizado[] = raw.map((i) => {
    const sku = extractSku(i)
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
      categoriaId: i.category_id,
      categoriaNome: i.category_id ? catNome.get(i.category_id) : undefined,
      temVariacoes: (i.variations?.length ?? 0) > 0,
      qtdFotos: i.pictures?.length ?? 0,
      imagens: (i.pictures ?? []).map((p) => p.url).filter(Boolean),
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
