/**
 * Cria os vínculos multiloja Bling↔Shopify via API (produtosLojas), a partir de
 * `catalogo/bling-vinculo-import.csv` (SKU;ID_Bling;ID_na_Loja/Shopify;Preco;Loja).
 *
 * Validado 13/jul: vínculo criado por API popula o "ID na loja" e o sync nativo
 * do Bling empurra estoque normalmente (1105xx 0→50). NÃO é fantasma.
 *
 *   npx tsx src/scripts/criar-vinculos-shopify.ts --dry   # lista o que faria
 *   npx tsx src/scripts/criar-vinculos-shopify.ts         # cria
 *
 * Idempotente: pula produto que já tem vínculo nesse canal.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { withBling } from '../api/client.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSV = join(__dirname, '..', '..', '..', 'catalogo', 'bling-vinculo-import.csv')
const LOJA_ID = 206107628
const dry = process.argv.includes('--dry')

async function main() {
  const linhas = readFileSync(CSV, 'utf8').split(/\r?\n/).filter((l) => l.trim())
  const rows = linhas.slice(1).map((l) => {
    const [sku, idBling, idShopify] = l.split(';')
    return { sku, idBling: Number(idBling), idShopify: (idShopify ?? '').trim() }
  }).filter((r) => r.idBling && r.idShopify)

  console.log(`📄 ${rows.length} vínculos no CSV`)
  let ok = 0, jaTem = 0, erros = 0
  for (const r of rows) {
    try {
      const ex: any = await withBling((b) => b.produtosLojas.get({ idLoja: LOJA_ID, idProduto: r.idBling } as any))
      if ((ex.data ?? []).length) { jaTem++; continue }
      if (dry) { console.log(`   + ${r.sku.padEnd(28).slice(0, 28)} Bling ${r.idBling} → loja ${r.idShopify}`); ok++; continue }
      await withBling((b) => b.produtosLojas.create({ codigo: r.idShopify, produto: { id: r.idBling }, loja: { id: LOJA_ID } } as any))
      ok++
    } catch (e) {
      erros++; console.log(`   ⚠️ ${r.sku}: ${e instanceof Error ? e.message : e}`)
    }
  }
  console.log(`\n${dry ? '🧪 DRY — ' : '✅ '}${ok} ${dry ? 'a criar' : 'criados'} | ${jaTem} já vinculados | ${erros} erros`)
  if (!dry && ok) console.log(`\n👉 Agora no Bling: selecionar todos os produtos → "Sincronizar estoque do sistema na loja virtual" → Dropchina oficial → Todos os Depósitos.`)
}

main().catch((e) => { console.error('FALHA:', e); process.exit(1) })
