import { shopeeGet } from './client.js'

export interface ShopeeCategory {
  category_id: number
  parent_category_id: number
  category_name: string
  has_children: boolean
  display_category_name?: string
}

export interface ShopeeCategoryAttribute {
  attribute_id: number
  attribute_name: string
  is_mandatory: boolean
  input_validation_type?: string
  attribute_value_list?: { value_id: number; original_value: string; display_value_name: string }[]
}

interface GetCategoriesResponse {
  error?: string
  message?: string
  response?: {
    category_list?: ShopeeCategory[]
  }
}

interface GetAttributesResponse {
  error?: string
  message?: string
  response?: {
    attribute_list?: ShopeeCategoryAttribute[]
  }
}

// Cache em memória (categorias se repetem muito durante o pull)
const catCache = new Map<number, ShopeeCategory>()
let allCatsCache: ShopeeCategory[] | null = null

/**
 * Retorna a lista completa de categorias da Shopee.
 * Usa língua pt-BR via parâmetro language.
 */
export async function getAllCategories(language = 'pt-br'): Promise<ShopeeCategory[]> {
  if (allCatsCache) return allCatsCache
  const res = await shopeeGet<GetCategoriesResponse>('/api/v2/product/get_category', {
    language,
  })
  const cats = res.response?.category_list ?? []
  allCatsCache = cats
  for (const c of cats) catCache.set(c.category_id, c)
  return cats
}

/** Retorna uma categoria pelo id (com cache). Busca na lista completa se não estiver no cache. */
export async function getCategoryById(categoryId: number): Promise<ShopeeCategory | undefined> {
  if (catCache.has(categoryId)) return catCache.get(categoryId)
  await getAllCategories()
  return catCache.get(categoryId)
}

/**
 * Retorna os atributos (ficha técnica) de uma categoria.
 * Útil para auditar o que falta preencher nos anúncios.
 */
export async function getCategoryAttributes(
  categoryId: number,
  language = 'pt-br',
): Promise<ShopeeCategoryAttribute[]> {
  const res = await shopeeGet<GetAttributesResponse>('/api/v2/product/get_attributes', {
    category_id: categoryId,
    language,
  })
  return res.response?.attribute_list ?? []
}
