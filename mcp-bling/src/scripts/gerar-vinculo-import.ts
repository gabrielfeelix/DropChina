/**
 * Gera a PLANILHA DE VÍNCULO multiloja (Bling → Shopify) pronta pro Gabriel importar.
 * Junta o de-para `catalogo/vinculo-shopify-bling.csv` (SKU → ID produto Shopify)
 * com o Bling (codigo → id do produto, preço, saldo de estoque).
 *
 *   npx tsx src/scripts/gerar-vinculo-import.ts
 *
 * Saída: `catalogo/bling-vinculo-import.csv` com as colunas que o importador do
 * Bling usa (A=ID Bling, B=ID na Loja, E=Preço, J=Loja). O Gabriel exporta a
 * planilha oficial (Produtos → "Exportar planilha p/ vínculo multiloja"), casa
 * pela coluna A (ID Bling) e cola a coluna B (ID na Loja) + E/J.
 *
 * Menu do import no Bling:
 *   Engrenagem → Todas as Configurações → Importações de Dados →
 *   "Importar e atualizar vínculos produtos multilojas".
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { withBling } from '../api/client.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEPARA = join(__dirname, '..', '..', '..', 'catalogo', 'vinculo-shopify-bling.csv')
const OUT = join(__dirname, '..', '..', '..', 'catalogo', 'bling-vinculo-import.csv')
const LOJA = 'Dropchina oficial'

const norm = (s: string) => s.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim()

async function main() {
  // de-para: "SKU (codigo Bling),ID Produto Shopify (ID na loja)"
  const linhas = readFileSync(DEPARA, 'utf8').split(/\r?\n/).filter((l) => l.trim())
  const depara = new Map<string, string>()
  for (const l of linhas.slice(1)) {
    const i = l.lastIndexOf(',')
    if (i < 0) continue
    const sku = l.slice(0, i).trim().replace(/^"|"$/g, '')
    const idShopify = l.slice(i + 1).trim()
    if (sku && idShopify) depara.set(norm(sku), { sku, idShopify } as any)
  }

  // Bling: codigo → {id, preco, saldo}
  const prods: any[] = []
  for (let pg = 1; pg <= 4; pg++) {
    const r: any = await withBling((b) => b.produtos.get({ pagina: pg, limite: 100 } as any))
    const d = r.data ?? []
    prods.push(...d)
    if (d.length < 100) break
  }
  const porCod = new Map<string, any>()
  for (const p of prods) porCod.set(norm(String(p.codigo ?? '')), p)

  const rows: string[] = ['SKU;ID_Bling (col A);ID_na_Loja/Shopify (col B);Preco (col E);Loja (col J)']
  let ok = 0, semBling = 0
  const faltando: string[] = []
  for (const [k, v] of depara as any) {
    const p = porCod.get(k)
    if (!p?.id) { semBling++; faltando.push(v.sku); continue }
    // saldo p/ conferência (não vai na planilha de vínculo, mas ajuda no diagnóstico)
    rows.push(`${v.sku};${p.id};${v.idShopify};${Number(p.preco ?? 0).toFixed(2)};${LOJA}`)
    ok++
  }

  writeFileSync(OUT, rows.join('\n') + '\n', 'utf8')
  console.log(`✅ ${ok} vínculos escritos em catalogo/bling-vinculo-import.csv`)
  if (semBling) console.log(`⚠️ ${semBling} SKU do de-para sem produto no Bling: ${faltando.join(' · ')}`)
  console.log(`\nLoja (col J) = "${LOJA}" (idLoja 206107628)`)
}

main().catch((e) => { console.error('FALHA:', e); process.exit(1) })
