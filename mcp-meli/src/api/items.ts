import { mlGet } from './client.js'

/** user_id do dono do token. */
export async function getMyUserId(): Promise<number> {
  const me = await mlGet<{ id: number; nickname?: string; tags?: string[] }>('/users/me')
  return me.id
}

/**
 * Lista TODOS os ids de anúncios do vendedor usando scan (passa de 1000).
 * O scroll_id expira em 5 min — consumimos continuamente.
 */
export async function listAllItemIds(userId: number): Promise<string[]> {
  const ids: string[] = []
  let scrollId: string | undefined
  for (;;) {
    const res = await mlGet<{ results: string[] | null; scroll_id?: string }>(
      `/users/${userId}/items/search`,
      { search_type: 'scan', limit: 100, scroll_id: scrollId },
    )
    const batch = res.results ?? []
    if (!batch.length) break
    ids.push(...batch)
    scrollId = res.scroll_id
    if (!scrollId) break
  }
  return ids
}

export interface MlItemRaw {
  id: string
  title: string
  price?: number
  base_price?: number
  available_quantity?: number
  status?: string
  listing_type_id?: string
  category_id?: string
  permalink?: string
  seller_custom_field?: string | null
  attributes?: { id: string; value_name?: string | null }[]
  variations?: {
    id: number
    seller_custom_field?: string | null
    attributes?: { id: string; value_name?: string | null }[]
  }[]
  pictures?: { url: string }[]
}

/** Multiget de itens (máx 20 ids por chamada). Retorna só os que vieram 200. */
export async function getItems(ids: string[]): Promise<MlItemRaw[]> {
  const out: MlItemRaw[] = []
  for (let i = 0; i < ids.length; i += 20) {
    const chunk = ids.slice(i, i + 20)
    const res = await mlGet<{ code: number; body: MlItemRaw }[]>('/items', {
      ids: chunk.join(','),
    })
    for (const entry of res) {
      if (entry.code === 200 && entry.body) out.push(entry.body)
    }
  }
  return out
}

/** Extrai o SKU do vendedor na ordem de prioridade recomendada pela doc do ML. */
export function extractSku(item: MlItemRaw): string | null {
  const fromAttrs = (attrs?: { id: string; value_name?: string | null }[]) =>
    attrs?.find((a) => a.id === 'SELLER_SKU')?.value_name ?? null

  // por variação primeiro
  for (const v of item.variations ?? []) {
    const s = fromAttrs(v.attributes) ?? v.seller_custom_field
    if (s) return s
  }
  return fromAttrs(item.attributes) ?? item.seller_custom_field ?? null
}
