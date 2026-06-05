import { mlGet } from './client.js'

export interface MlCategory {
  id: string
  name: string
  path_from_root?: { id: string; name: string }[]
}

const cache = new Map<string, MlCategory>()

/** Detalhe de uma categoria (com cache em memória — categorias se repetem muito). */
export async function getCategory(categoryId: string): Promise<MlCategory> {
  const hit = cache.get(categoryId)
  if (hit) return hit
  const cat = await mlGet<MlCategory>(`/categories/${categoryId}`)
  cache.set(categoryId, cat)
  return cat
}

export interface MlAttribute {
  id: string
  name: string
  value_type?: string
  tags?: Record<string, boolean>
}

/** Atributos (ficha técnica) de uma categoria — pra auditar o que falta. */
export async function getCategoryAttributes(categoryId: string): Promise<MlAttribute[]> {
  return mlGet<MlAttribute[]>(`/categories/${categoryId}/attributes`)
}
