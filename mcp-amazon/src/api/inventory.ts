/**
 * inventory.ts — FBA Inventory API (READ-ONLY)
 *
 * Endpoint: GET /fba/inventory/v1/summaries
 * Doc: https://developer-docs.amazon.com/sp-api/docs/fba-inventory-api-v1-reference
 *
 * Retorna resumos de inventário FBA (Amazon fulfillment). Útil como fonte de
 * SKUs para enriquecer com listings.
 *
 * Throttling: ~2 req/s (burst 2, restore 2/s) — aplicamos pausa entre páginas.
 */
import { spCall } from './client.js'
import { config } from '../config.js'

interface InventorySummaryRaw {
  asin?: string
  fnSku?: string
  sellerSku?: string
  condition?: string
  inventoryDetails?: {
    fulfillableQuantity?: number
    inboundWorkingQuantity?: number
    inboundShippedQuantity?: number
    inboundReceivingQuantity?: number
    reservedQuantity?: { totalReservedQuantity?: number }
    researchingQuantity?: { totalResearchingQuantity?: number }
    unfulfillableQuantity?: { totalUnfulfillableQuantity?: number }
  }
  lastUpdatedTime?: string
  productName?: string
  totalQuantity?: number
}

interface InventoryResponse {
  payload?: {
    granularity?: { granularityType?: string; granularityId?: string }
    inventorySummaries?: InventorySummaryRaw[]
  }
  pagination?: { nextToken?: string }
}

export interface InventorySummaryNormalizado {
  sku: string
  asin: string | null
  fnSku: string | null
  titulo: string | null
  qtdDisponivel: number
  qtdTotal: number
  /** Estoque reservado (pedidos pendentes, transferências). */
  qtdReservado: number
  ultimaAtualizacao: string | null
}

function normaliza(raw: InventorySummaryRaw): InventorySummaryNormalizado {
  return {
    sku: raw.sellerSku ?? '',
    asin: raw.asin ?? null,
    fnSku: raw.fnSku ?? null,
    titulo: raw.productName ?? null,
    qtdDisponivel: raw.inventoryDetails?.fulfillableQuantity ?? raw.totalQuantity ?? 0,
    qtdTotal: raw.totalQuantity ?? 0,
    qtdReservado: raw.inventoryDetails?.reservedQuantity?.totalReservedQuantity ?? 0,
    ultimaAtualizacao: raw.lastUpdatedTime ?? null,
  }
}

/**
 * Lista TODOS os summaries de inventário FBA do seller.
 * Pagina automaticamente até esgotar (nextToken).
 */
export async function listAllInventorySummaries(): Promise<InventorySummaryNormalizado[]> {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
  const results: InventorySummaryNormalizado[] = []
  let nextToken: string | undefined

  do {
    const query: Record<string, string | number | boolean> = {
      details: true,
      granularityType: 'Marketplace',
      granularityId: config.marketplaceId,
      marketplaceIds: config.marketplaceId,
    }

    if (nextToken) query['nextToken'] = nextToken

    const res = await spCall<InventoryResponse>('getInventorySummaries', {
      endpoint: 'fbaInventory',
      query,
    })

    const summaries = res.payload?.inventorySummaries ?? []
    results.push(...summaries.map(normaliza))
    nextToken = res.pagination?.nextToken

    // respeita throttling entre páginas
    if (nextToken) await sleep(500)
  } while (nextToken)

  return results
}
