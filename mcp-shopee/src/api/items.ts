import { shopeeGet } from './client.js'

// ---------------------------------------------------------------------------
// Tipos da Shopee Open Platform v2
// ---------------------------------------------------------------------------

export interface ShopeeItemSummary {
  item_id: number
  item_status: string
  update_time?: number
}

export interface ShopeePrice {
  currency: string
  original_price: number
  current_price: number
}

export interface ShopeeStock {
  stock_type: number
  stock_location_id?: string
  current_stock: number
  normal_stock?: number
  reserved_stock?: number
}

export interface ShopeeVariation {
  variation_id: number
  tier_variation_index?: number[]
  original_price: number
  price: number
  stock_info?: ShopeeStock[]
  seller_stock?: ShopeeStock[]
  sku?: string
  status?: string
}

export interface ShopeeLogisticInfo {
  logistic_id: number
  logistic_name: string
  enabled: boolean
  shipping_fee?: number
  is_free?: boolean
}

export interface ShopeeItemBaseInfo {
  item_id: number
  category_id: number
  item_name: string
  description?: string
  item_sku?: string
  create_time?: number
  update_time?: number
  price_info?: ShopeePrice[]
  stock_info?: ShopeeStock[]
  image?: { image_id_list?: string[]; image_url_list?: string[] }
  weight?: number
  dimension?: { package_length?: number; package_width?: number; package_height?: number }
  logistic_info?: ShopeeLogisticInfo[]
  pre_order?: { is_pre_order?: boolean; days_to_ship?: number }
  condition?: string
  item_status?: string
  has_model?: boolean
  brand?: { brand_id?: number; original_brand_name?: string }
  tax_info?: { ncm?: string; gpc?: string }
  attribute_list?: { attribute_id: number; attribute_name: string; attribute_value_list?: { value_id?: number; original_value?: string }[] }[]
  model_list?: ShopeeVariation[]
}

// ---------------------------------------------------------------------------
// Tipo normalizado para auditoria
// ---------------------------------------------------------------------------

export interface ItemNormalizado {
  itemId: number
  titulo: string
  sku: string | null
  status?: string
  preco?: number
  estoqueTotal: number
  categoriaId: number
  temVariacoes: boolean
  qtdFotos: number
  imagens: string[]
  pesoBrutoKg?: number
  comprimentoCm?: number
  larguraCm?: number
  alturaCm?: number
  marca?: string
  condicao?: string
  preOrder?: boolean
}

// ---------------------------------------------------------------------------
// Funções de leitura
// ---------------------------------------------------------------------------

interface GetItemListResponse {
  error?: string
  message?: string
  response?: {
    item?: ShopeeItemSummary[]
    total_count?: number
    has_next_page?: boolean
    next_offset?: number
  }
}

/**
 * Lista TODOS os item_ids da loja usando paginação por offset.
 * page_size máximo da Shopee é 100.
 */
export async function listAllItemIds(
  status: 'NORMAL' | 'BANNED' | 'DELETED' | 'UNLIST' | 'ALL' = 'NORMAL',
): Promise<number[]> {
  const ids: number[] = []
  let offset = 0
  const pageSize = 100

  for (;;) {
    const res = await shopeeGet<GetItemListResponse>('/api/v2/product/get_item_list', {
      offset,
      page_size: pageSize,
      item_status: status,
    })
    const items = res.response?.item ?? []
    ids.push(...items.map((i) => i.item_id))
    if (!res.response?.has_next_page || !items.length) break
    offset = res.response.next_offset ?? offset + pageSize
  }
  return ids
}

interface GetItemBaseInfoResponse {
  error?: string
  message?: string
  response?: {
    item_list?: ShopeeItemBaseInfo[]
  }
}

/**
 * Detalhe de múltiplos itens (máx 50 ids por chamada conforme Shopee doc).
 * Retorna os que vieram com sucesso.
 */
export async function getItemsBaseInfo(ids: number[]): Promise<ShopeeItemBaseInfo[]> {
  const out: ShopeeItemBaseInfo[] = []
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50)
    const res = await shopeeGet<GetItemBaseInfoResponse>('/api/v2/product/get_item_base_info', {
      item_id_list: chunk.join(','),
      need_tax_info: true,
      need_complaint_policy: false,
    })
    const items = res.response?.item_list ?? []
    out.push(...items)
  }
  return out
}

/** Soma o estoque disponível de um item (considera variações se houver). */
export function calcEstoqueTotal(item: ShopeeItemBaseInfo): number {
  if (item.has_model && item.model_list?.length) {
    return item.model_list.reduce((sum, m) => {
      const s = m.stock_info ?? m.seller_stock ?? []
      return sum + s.reduce((a, b) => a + (b.current_stock ?? 0), 0)
    }, 0)
  }
  const stock = item.stock_info ?? []
  return stock.reduce((a, b) => a + (b.current_stock ?? 0), 0)
}

/** Extrai o preço atual (considera o primeiro price_info disponível). */
export function extractPreco(item: ShopeeItemBaseInfo): number | undefined {
  return item.price_info?.[0]?.current_price
}

/** Normaliza um ShopeeItemBaseInfo para auditoria. */
export function normalizeItem(item: ShopeeItemBaseInfo): ItemNormalizado {
  return {
    itemId: item.item_id,
    titulo: item.item_name,
    sku: item.item_sku || null,
    status: item.item_status,
    preco: extractPreco(item),
    estoqueTotal: calcEstoqueTotal(item),
    categoriaId: item.category_id,
    temVariacoes: item.has_model ?? false,
    qtdFotos: item.image?.image_url_list?.length ?? item.image?.image_id_list?.length ?? 0,
    imagens: item.image?.image_url_list ?? [],
    pesoBrutoKg: item.weight,
    comprimentoCm: item.dimension?.package_length,
    larguraCm: item.dimension?.package_width,
    alturaCm: item.dimension?.package_height,
    marca: item.brand?.original_brand_name,
    condicao: item.condition,
    preOrder: item.pre_order?.is_pre_order,
  }
}
