/**
 * catalog.ts — Catalog Items API (READ-ONLY)
 *
 * Endpoints usados:
 *   - searchCatalogItems  (GET /catalog/2022-04-01/items)
 *   - getCatalogItem      (GET /catalog/2022-04-01/items/{asin})
 *
 * Doc: https://developer-docs.amazon.com/sp-api/docs/catalog-items-api-v2022-04-01-reference
 *
 * Normaliza ASIN, SKU, GTIN, preço e atributos principais para auditoria.
 */
import { spCall } from './client.js'
import { config } from '../config.js'

// ─── Tipos internos (subset do schema real da SP-API) ───────────────────────

interface CatalogItemSummary {
  marketplaceId?: string
  asin?: string
  itemName?: string
  brandName?: string
  browseClassification?: { displayName?: string; classificationId?: string }
  manufacturer?: string
  modelNumber?: string
  packageQuantity?: number
  itemClassification?: string
}

interface CatalogItemIdentifier {
  identifierType?: string
  identifier?: string
}

interface CatalogItemRaw {
  asin?: string
  summaries?: CatalogItemSummary[]
  identifiers?: {
    marketplaceId?: string
    identifiers?: CatalogItemIdentifier[]
  }[]
  attributes?: Record<string, unknown>
  images?: {
    marketplaceId?: string
    images?: { variant?: string; link?: string; height?: number; width?: number }[]
  }[]
  salesRanks?: {
    marketplaceId?: string
    displayGroupRanks?: { websiteDisplayGroup?: string; rank?: number; link?: string }[]
    classificationRanks?: { classificationId?: string; rank?: number }[]
  }[]
}

interface CatalogSearchResponse {
  numberOfResults?: number
  items?: CatalogItemRaw[]
  pagination?: { nextToken?: string }
  refinements?: unknown
}

// ─── Tipo normalizado (exposto para os scripts e MCP) ───────────────────────

export interface CatalogItemNormalizado {
  asin: string
  titulo: string | null
  marca: string | null
  modelo: string | null
  gtin: string | null
  ean: string | null
  upc: string | null
  /** Classificação de navegação (ex.: "Impressoras") */
  categoria: string | null
  categoriaId: string | null
  fabricante: string | null
  imagens: string[]
  rankVendas: number | null
}

function normalizaCatalogItem(raw: CatalogItemRaw): CatalogItemNormalizado {
  const asin = raw.asin ?? ''

  // Summaries filtrados pelo marketplace atual
  const summary = raw.summaries?.find((s) => s.marketplaceId === config.marketplaceId) ?? raw.summaries?.[0]

  // Identifiers: busca GTIN, EAN, UPC
  const allIdentifiers =
    raw.identifiers?.find((i) => i.marketplaceId === config.marketplaceId)?.identifiers ??
    raw.identifiers?.flatMap((i) => i.identifiers ?? []) ??
    []

  const findId = (type: string) =>
    allIdentifiers.find((id) => id.identifierType?.toUpperCase() === type)?.identifier ?? null

  // Imagens principais (variant MAIN)
  const imagens =
    (raw.images?.find((i) => i.marketplaceId === config.marketplaceId) ?? raw.images?.[0])?.images
      ?.filter((img) => img.variant === 'MAIN' || img.variant === 'PT01')
      .map((img) => img.link ?? '')
      .filter(Boolean) ?? []

  // Rank de vendas
  const ranks = raw.salesRanks?.find((sr) => sr.marketplaceId === config.marketplaceId)
  const rankVendas = ranks?.displayGroupRanks?.[0]?.rank ?? null

  return {
    asin,
    titulo: summary?.itemName ?? null,
    marca: summary?.brandName ?? null,
    modelo: summary?.modelNumber ?? null,
    gtin: findId('GTIN'),
    ean: findId('EAN'),
    upc: findId('UPC'),
    categoria: summary?.browseClassification?.displayName ?? null,
    categoriaId: summary?.browseClassification?.classificationId ?? null,
    fabricante: summary?.manufacturer ?? null,
    imagens,
    rankVendas,
  }
}

/**
 * Busca itens no catálogo Amazon por palavra-chave, ASIN, EAN ou SKU do vendedor.
 * Retorna lista normalizada.
 */
export async function searchCatalogItems(params: {
  keywords?: string
  identifiers?: string[]
  identifierType?: 'ASIN' | 'EAN' | 'GTIN' | 'ISBN' | 'JAN' | 'MINSAN' | 'SKU' | 'UPC'
  pageSize?: number
  pageToken?: string
}): Promise<{ items: CatalogItemNormalizado[]; nextToken?: string; total: number }> {
  const query: Record<string, string | string[] | number | boolean | undefined> = {
    marketplaceIds: config.marketplaceId,
    includedData: 'summaries,identifiers,images,salesRanks',
    pageSize: params.pageSize ?? 20,
  }

  if (params.keywords) query['keywords'] = params.keywords
  if (params.identifiers?.length) {
    query['identifiers'] = params.identifiers
    query['identifiersType'] = params.identifierType ?? 'EAN'
  }
  if (params.pageToken) query['pageToken'] = params.pageToken

  const res = await spCall<CatalogSearchResponse>('searchCatalogItems', {
    endpoint: 'catalog',
    query,
  })

  return {
    items: (res.items ?? []).map(normalizaCatalogItem),
    nextToken: res.pagination?.nextToken,
    total: res.numberOfResults ?? 0,
  }
}

/**
 * Detalhe de um ASIN específico no catálogo Amazon.
 */
export async function getCatalogItem(asin: string): Promise<CatalogItemNormalizado> {
  const res = await spCall<CatalogItemRaw>('getCatalogItem', {
    endpoint: 'catalog',
    path: { asin },
    query: {
      marketplaceIds: config.marketplaceId,
      includedData: 'summaries,identifiers,images,salesRanks,attributes',
    },
  })

  return normalizaCatalogItem(res)
}
