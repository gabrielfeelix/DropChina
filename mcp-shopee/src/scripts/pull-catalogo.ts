/**
 * Puxa o catálogo completo de anúncios da loja Shopee (READ-ONLY) e gera:
 *   out/catalogo.json   — todos os itens normalizados
 *   out/auditoria.md     — relatório de pendências (sem SKU, sem foto, por categoria)
 *
 *   npm run pull
 *
 * NÃO escreve nada na Shopee. Só lê e salva local.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  listAllItemIds,
  getItemsBaseInfo,
  normalizeItem,
  type ItemNormalizado,
  type ShopeeItemBaseInfo,
} from '../api/items.js'
import { getCategoryById, getAllCategories } from '../api/categories.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', '..', 'out')

async function main() {
  console.log('📥 Listando item_ids (paginado)...')
  const ids = await listAllItemIds('NORMAL')
  console.log(`   ${ids.length} anúncios ativos encontrados.`)

  if (!ids.length) {
    console.log('\n⚠️  Nenhum anúncio ativo encontrado. Verifique as credenciais e o shop_id.\n')
    return
  }

  console.log('📦 Puxando detalhes (50 ids/req)...')
  const raw: ShopeeItemBaseInfo[] = await getItemsBaseInfo(ids)
  console.log(`   ${raw.length} itens detalhados.`)

  // Pré-aquece o cache de categorias (evita N+1 de requests individuais)
  console.log('🗂️  Carregando categorias...')
  await getAllCategories()

  const catNome = new Map<number, string>()
  const catIds = [...new Set(raw.map((i) => i.category_id))]
  for (const cid of catIds) {
    try {
      const c = await getCategoryById(cid)
      catNome.set(cid, c?.category_name ?? String(cid))
    } catch {
      catNome.set(cid, String(cid))
    }
  }

  const itens: ItemNormalizado[] = raw.map(normalizeItem)

  mkdirSync(OUT, { recursive: true })
  writeFileSync(join(OUT, 'catalogo.json'), JSON.stringify(itens, null, 2))

  // --- Auditoria ---
  const semSku = itens.filter((i) => !i.sku)
  const semFoto = itens.filter((i) => i.qtdFotos === 0)
  const semEstoque = itens.filter((i) => i.estoqueTotal === 0)
  const preOrder = itens.filter((i) => i.preOrder)

  const porCategoria = new Map<string, number>()
  itens.forEach((i) => {
    const k = catNome.get(i.categoriaId) ?? String(i.categoriaId)
    porCategoria.set(k, (porCategoria.get(k) ?? 0) + 1)
  })

  const ts = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const md = [
    '# Auditoria do catálogo Shopee — DropChina',
    '',
    `Gerado em: ${ts}`,
    `Total de anúncios ativos: **${itens.length}**`,
    '',
    '## Pendências',
    `- Sem SKU (campo item_sku vazio): **${semSku.length}**`,
    `- Sem foto: **${semFoto.length}**`,
    `- Estoque zerado: **${semEstoque.length}**`,
    `- Pré-venda (pre_order): **${preOrder.length}**`,
    '',
    '## Anúncios por categoria',
    ...[...porCategoria.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `- ${k}: ${n}`),
    '',
    '## Top 30 sem SKU (corrigir antes do go-live)',
    ...semSku.slice(0, 30).map((i) => `- ${i.itemId} | ${i.titulo}`),
    '',
    '## Top 20 com estoque zerado',
    ...semEstoque.slice(0, 20).map((i) => `- ${i.itemId} | ${i.titulo}`),
    '',
  ].join('\n')

  writeFileSync(join(OUT, 'auditoria.md'), md)

  console.log(`\n✅ Pronto.`)
  console.log(`   out/catalogo.json  (${itens.length} itens)`)
  console.log(`   out/auditoria.md`)
  console.log(
    `\n   Resumo: ${semSku.length} sem SKU, ${semFoto.length} sem foto, ${semEstoque.length} sem estoque.\n`,
  )
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
