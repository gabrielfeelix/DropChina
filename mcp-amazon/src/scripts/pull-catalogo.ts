/**
 * pull-catalogo.ts — Puxa catálogo/inventário do seller Amazon BR (READ-ONLY).
 *
 * Gera:
 *   out/catalogo.json    — todos os items normalizados (inventário FBA + detalhes catalog)
 *   out/auditoria.md     — relatório de pendências (sem GTIN, sem título, etc.)
 *
 * Uso:
 *   npm run pull
 *   npm run pull -- --seller-id=A1XXXXX  (sem essa flag, lê de AMAZON_SELLER_ID no .env)
 *
 * NÃO escreve nada na Amazon nem no Bling. Só lê e salva local.
 *
 * ─── ESTRATÉGIA DE LISTAGEM ─────────────────────────────────────────────────
 *
 * A SP-API não tem um endpoint "liste todos os meus produtos" simples.
 * Usamos a FBA Inventory API como fonte primária de SKUs (lista todos os SKUs
 * com estoque FBA). Para sellers MFN (fulfillment próprio), a alternativa seria
 * a Reports API (relatório GET_MERCHANT_LISTINGS_ALL_DATA — assíncrono, exige
 * AWS credentials). O scaffold cobre FBA por ser o modelo mais comum no Brasil.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { listAllInventorySummaries, type InventorySummaryNormalizado } from '../api/inventory.js'
import { getCatalogItem, type CatalogItemNormalizado } from '../api/catalog.js'
import { getListingsItem, type ListingItemNormalizado } from '../api/listings.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', '..', 'out')

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Seller ID — pode vir de --seller-id= na CLI ou de AMAZON_SELLER_ID no env
function getSellerId(): string {
  const arg = process.argv.find((a) => a.startsWith('--seller-id='))
  if (arg) return arg.slice('--seller-id='.length)
  const env = process.env['AMAZON_SELLER_ID']
  if (env) return env
  throw new Error(
    'Seller ID não informado. Use --seller-id=A1XXXX ou defina AMAZON_SELLER_ID no .env.\n' +
    'Encontre em: Seller Central > Account > Business Information > Seller token.',
  )
}

interface ItemConsolidado {
  sku: string
  asin: string | null
  fnSku: string | null
  titulo: string | null
  marca: string | null
  modelo: string | null
  gtin: string | null
  ean: string | null
  categoria: string | null
  // estoque
  qtdDisponivel: number
  qtdTotal: number
  qtdReservado: number
  // listing
  preco: number | null
  moeda: string | null
  tipoFulfillment: string
  statusListing: string[]
  imagemPrincipal: string | null
  imagens: string[]
  // pendências do listing
  pendencias: { codigo: string; mensagem: string; severidade: string }[]
  // auditoria
  semGtin: boolean
  semTitulo: boolean
  semPreco: boolean
  semFoto: boolean
  temPendenciaErro: boolean
}

function consolida(
  inv: InventorySummaryNormalizado,
  cat: CatalogItemNormalizado | null,
  listing: ListingItemNormalizado | null,
): ItemConsolidado {
  const titulo = listing?.titulo ?? cat?.titulo ?? inv.titulo
  const asin = inv.asin ?? listing?.asin ?? cat?.asin ?? null
  const gtin = cat?.gtin ?? cat?.ean ?? null
  const imagens = cat?.imagens ?? (listing?.imagemPrincipal ? [listing.imagemPrincipal] : [])

  return {
    sku: inv.sku,
    asin,
    fnSku: inv.fnSku,
    titulo,
    marca: cat?.marca ?? null,
    modelo: cat?.modelo ?? null,
    gtin,
    ean: cat?.ean ?? null,
    categoria: cat?.categoria ?? null,
    qtdDisponivel: inv.qtdDisponivel,
    qtdTotal: inv.qtdTotal,
    qtdReservado: inv.qtdReservado,
    preco: listing?.preco ?? null,
    moeda: listing?.moeda ?? null,
    tipoFulfillment: listing?.tipoFulfillment ?? 'FBA',
    statusListing: listing?.status ?? [],
    imagemPrincipal: listing?.imagemPrincipal ?? imagens[0] ?? null,
    imagens,
    pendencias: listing?.pendencias ?? [],
    // flags de auditoria
    semGtin: !gtin,
    semTitulo: !titulo,
    semPreco: listing?.preco == null,
    semFoto: imagens.length === 0,
    temPendenciaErro: (listing?.pendencias ?? []).some((p) => p.severidade === 'ERROR'),
  }
}

async function main() {
  // Força dotenv antes de tudo
  const { default: dotenv } = await import('dotenv')
  dotenv.config()

  const sellerId = getSellerId()
  console.log(`\n🛒 Seller ID: ${sellerId}`)

  // 1. Lista inventário FBA (fonte primária de SKUs)
  console.log('\n📥 Listando inventário FBA...')
  const inventario = await listAllInventorySummaries()
  console.log(`   ${inventario.length} SKUs encontrados no inventário FBA.`)

  if (inventario.length === 0) {
    console.log('\n⚠️  Nenhum SKU FBA encontrado. Possíveis causas:')
    console.log('   - Seller usa fulfillment próprio (MFN) — use Reports API')
    console.log('   - Credenciais sem permissão p/ FBA Inventory API')
    console.log('   - Marketplace incorreto\n')
  }

  // 2. Enriquece cada item com Catalog Items API (por ASIN) e Listings API (por SKU)
  console.log('\n📦 Enriquecendo com Catalog + Listings (pode demorar pelo throttling)...')
  const itens: ItemConsolidado[] = []

  for (let i = 0; i < inventario.length; i++) {
    const inv = inventario[i]
    const progresso = `[${i + 1}/${inventario.length}]`

    // Catalog Items — por ASIN (se tiver)
    let cat: CatalogItemNormalizado | null = null
    if (inv.asin) {
      try {
        cat = await getCatalogItem(inv.asin)
        // ~2 req/s — pausa entre chamadas
        await sleep(550)
      } catch {
        // continua sem dados do catálogo
      }
    }

    // Listings Items — por SKU
    let listing: ListingItemNormalizado | null = null
    try {
      listing = await getListingsItem(sellerId, inv.sku)
      await sleep(220) // ~5 req/s
    } catch {
      // continua sem dados do listing
    }

    itens.push(consolida(inv, cat, listing))

    if ((i + 1) % 10 === 0 || i === inventario.length - 1) {
      console.log(`   ${progresso} processados — último: ${inv.sku}`)
    }
  }

  // 3. Salva catálogo
  mkdirSync(OUT, { recursive: true })
  writeFileSync(join(OUT, 'catalogo.json'), JSON.stringify(itens, null, 2))

  // 4. Auditoria
  const semGtin = itens.filter((i) => i.semGtin)
  const semTitulo = itens.filter((i) => i.semTitulo)
  const semPreco = itens.filter((i) => i.semPreco)
  const semFoto = itens.filter((i) => i.semFoto)
  const comErro = itens.filter((i) => i.temPendenciaErro)
  const inativos = itens.filter((i) => i.statusListing.includes('INACTIVE'))

  const porCategoria = new Map<string, number>()
  itens.forEach((i) => {
    const k = i.categoria ?? '(sem categoria)'
    porCategoria.set(k, (porCategoria.get(k) ?? 0) + 1)
  })

  const ts = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const md = [
    '# Auditoria do catálogo Amazon BR — DropChina',
    '',
    `Gerado em: ${ts}`,
    `Total de SKUs (inventário FBA): **${itens.length}**`,
    '',
    '## Pendências',
    `- Sem GTIN/EAN: **${semGtin.length}**`,
    `- Sem título: **${semTitulo.length}**`,
    `- Sem preço: **${semPreco.length}**`,
    `- Sem foto: **${semFoto.length}**`,
    `- Com erros no listing (AMAZON ERROR): **${comErro.length}**`,
    `- Listings inativos: **${inativos.length}**`,
    '',
    '## Distribuição por categoria',
    ...[...porCategoria.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `- ${k}: ${n}`),
    '',
    '## Top 30 sem GTIN (corrigir antes do go-live)',
    ...semGtin.slice(0, 30).map((i) => `- ${i.sku} | ASIN: ${i.asin ?? '(sem ASIN)'} | ${i.titulo ?? '(sem título)'}`),
    '',
    '## Top 20 com erros no listing',
    ...comErro.slice(0, 20).map(
      (i) =>
        `- **${i.sku}** | ${i.asin ?? ''}\n` +
        i.pendencias
          .filter((p) => p.severidade === 'ERROR')
          .map((p) => `  - [${p.codigo}] ${p.mensagem}`)
          .join('\n'),
    ),
    '',
  ].join('\n')

  writeFileSync(join(OUT, 'auditoria.md'), md)

  console.log(`\n✅ Pronto.`)
  console.log(`   out/catalogo.json  (${itens.length} SKUs)`)
  console.log(`   out/auditoria.md`)
  console.log(`\n   Resumo: ${semGtin.length} sem GTIN, ${semTitulo.length} sem título, ${comErro.length} com erros.\n`)
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
