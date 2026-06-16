/**
 * listings.ts — Listings Items API (READ-ONLY)
 *
 * Endpoints usados:
 *   - getListingsItem   (GET /listings/2021-08-01/items/{sellerId}/{sku})
 *   - getListingsItems  (não existe no v2021 — usamos getListingsItem por SKU)
 *
 * Para listar TODOS os SKUs do seller, a SP-API v0 tem:
 *   - listCatalogItems (deprecated) ou Reports API (ListingsReport) — ver comentário.
 *
 * Doc: https://developer-docs.amazon.com/sp-api/docs/listings-items-api-v2021-08-01-reference
 *
 * NÃO escreve nada. Só GET.
 */
import { spCall } from './client.js'
import { config } from '../config.js'

// ─── Tipos internos (subset do schema real) ──────────────────────────────────

interface ListingsSummary {
  marketplaceId?: string
  asin?: string
  productType?: string
  conditionType?: string
  status?: string[]
  itemName?: string
  listingDate?: string
  mainImage?: { link?: string; height?: number; width?: number }
}

interface ListingsOffer {
  marketplaceId?: string
  offerType?: string
  price?: { currency?: string; amount?: string }
  points?: { pointsNumber?: number }
}

interface ListingsFulfillment {
  fulfillmentAvailability?: { fulfillmentChannelCode?: string; quantity?: number }[]
}

interface ListingsItemRaw {
  sku?: string
  summaries?: ListingsSummary[]
  attributes?: Record<string, unknown>
  issues?: { code?: string; message?: string; severity?: string; attributeName?: string }[]
  offers?: ListingsOffer[]
  fulfillmentAvailability?: ListingsFulfillment['fulfillmentAvailability']
}

// ─── Tipo normalizado ─────────────────────────────────────────────────────────

export interface ListingItemNormalizado {
  sku: string
  asin: string | null
  titulo: string | null
  status: string[]
  preco: number | null
  moeda: string | null
  /** Estoque disponível (canal AFN/FBA ou MFN/seller). */
  estoqueAfn: number | null
  estoqueMfn: number | null
  /** FBA = Amazon cuida do fulfillment; MFN = vendedor envia. */
  tipoFulfillment: 'FBA' | 'MFN' | 'desconhecido'
  imagemPrincipal: string | null
  /** Alertas/erros do listing (ex.: título ausente, categoria inválida). */
  pendencias: { codigo: string; mensagem: string; severidade: string }[]
}

function normalizaListingsItem(sku: string, raw: ListingsItemRaw): ListingItemNormalizado {
  const summary = raw.summaries?.find((s) => s.marketplaceId === config.marketplaceId) ?? raw.summaries?.[0]
  const offer = raw.offers?.find((o) => o.marketplaceId === config.marketplaceId) ?? raw.offers?.[0]

  // Estoque por canal
  const afn = raw.fulfillmentAvailability?.find(
    (f) => f.fulfillmentChannelCode === 'AMAZON_NA' || f.fulfillmentChannelCode === 'DEFAULT',
  )
  const mfn = raw.fulfillmentAvailability?.find((f) => f.fulfillmentChannelCode === 'DEFAULT')

  // Detecta tipo de fulfillment pelo canal
  const canais = raw.fulfillmentAvailability?.map((f) => f.fulfillmentChannelCode ?? '') ?? []
  const isFba = canais.some((c) => c.startsWith('AMAZON'))
  const tipoFulfillment = isFba ? 'FBA' : canais.length > 0 ? 'MFN' : 'desconhecido'

  const preco = offer?.price?.amount ? parseFloat(offer.price.amount) : null

  return {
    sku,
    asin: summary?.asin ?? null,
    titulo: summary?.itemName ?? null,
    status: summary?.status ?? [],
    preco: isNaN(preco ?? NaN) ? null : preco,
    moeda: offer?.price?.currency ?? null,
    estoqueAfn: afn?.quantity ?? null,
    estoqueMfn: mfn?.quantity ?? null,
    tipoFulfillment,
    imagemPrincipal: summary?.mainImage?.link ?? null,
    pendencias: (raw.issues ?? []).map((i) => ({
      codigo: i.code ?? '',
      mensagem: i.message ?? '',
      severidade: i.severity ?? '',
    })),
  }
}

/**
 * Lê o detalhe de um listing do seller por SKU.
 *
 * ATENÇÃO: A SP-API exige o `sellerId` (Merchant Token / MWS Seller ID) — não
 * confundir com o user_id. Obtenha em Seller Central > Account Info.
 */
export async function getListingsItem(sellerId: string, sku: string): Promise<ListingItemNormalizado> {
  const raw = await spCall<ListingsItemRaw>('getListingsItem', {
    endpoint: 'listingsItems',
    path: { sellerId, sku: encodeURIComponent(sku) },
    query: {
      marketplaceIds: config.marketplaceId,
      includedData: 'summaries,attributes,issues,offers,fulfillmentAvailability',
    },
  })

  return normalizaListingsItem(sku, raw)
}

/**
 * Lê múltiplos listings por lista de SKUs (serial — SP-API não tem multiget).
 * Pausa entre chamadas para respeitar throttling (~5 req/s no endpoint).
 */
export async function getListingsItems(
  sellerId: string,
  skus: string[],
  onProgress?: (done: number, total: number) => void,
): Promise<ListingItemNormalizado[]> {
  const results: ListingItemNormalizado[] = []
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  for (let i = 0; i < skus.length; i++) {
    try {
      const item = await getListingsItem(sellerId, skus[i])
      results.push(item)
    } catch (err) {
      // SKU não encontrado ou erro isolado — registra como pendência e continua
      results.push({
        sku: skus[i],
        asin: null,
        titulo: null,
        status: [],
        preco: null,
        moeda: null,
        estoqueAfn: null,
        estoqueMfn: null,
        tipoFulfillment: 'desconhecido',
        imagemPrincipal: null,
        pendencias: [
          {
            codigo: 'ERRO_LEITURA',
            mensagem: err instanceof Error ? err.message : String(err),
            severidade: 'ERROR',
          },
        ],
      })
    }

    onProgress?.(i + 1, skus.length)
    // ~5 req/s → 200ms entre chamadas (conservador)
    if (i < skus.length - 1) await sleep(220)
  }

  return results
}

/**
 * NOTA: Para LISTAR todos os SKUs do seller, a Listings Items API v2021 não
 * oferece endpoint de listagem paginada. Opções READ-ONLY:
 *
 * 1. Reports API: solicitar relatório "GET_MERCHANT_LISTINGS_ALL_DATA"
 *    (assíncrono — cria Report, aguarda processamento, faz download).
 *    Exige AWS credentials (SigV4). Ver: https://developer-docs.amazon.com/sp-api/docs/reports-api-v2021-06-30-reference
 *
 * 2. FBA Inventory API: getInventorySummaries — lista SKUs com estoque FBA.
 *    Disponível em src/api/inventory.ts (a implementar quando SP-API estiver ativa).
 *
 * Para o scaffold inicial, pull-catalogo.ts usa a FBA Inventory API como fonte
 * primária de SKUs e enriquece com getListingsItem.
 */
