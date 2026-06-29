import { withBling } from './client.js'

export interface Categoria {
  id: number
  descricao: string
  categoriaPai?: { id: number }
}

/** Lista todas as categorias de produto (paginando até o fim). */
export async function listCategorias(): Promise<Categoria[]> {
  const all: Categoria[] = []
  let pagina = 1
  const limite = 100

  for (;;) {
    const res = await withBling((bling) =>
      bling.categoriasProdutos.get({ pagina, limite }),
    )
    const page = res.data ?? []
    all.push(...(page as Categoria[]))
    if (page.length < limite) break
    pagina += 1
  }
  return all
}

/** Cria uma categoria. `categoriaPaiId` opcional para subcategorias. */
export async function createCategoria(
  descricao: string,
  categoriaPaiId?: number,
): Promise<{ id: number }> {
  const body =
    categoriaPaiId != null
      ? { descricao, categoriaPai: { id: categoriaPaiId } }
      : { descricao }
  const res = await withBling((bling) => bling.categoriasProdutos.create(body))
  return res.data
}

/**
 * Idempotente: retorna a categoria existente (match por descrição + categoria-pai,
 * case-insensitive) ou cria uma nova. Recebe a lista já carregada para evitar relistar
 * a cada item. `categoriaPaiId` distingue subcategorias homônimas em pais diferentes
 * (ex.: departamento "Variedades" vs subcategoria "Variedades").
 */
export async function ensureCategoria(
  descricao: string,
  existentes: Categoria[],
  categoriaPaiId?: number,
): Promise<{ id: number; created: boolean }> {
  const alvo = descricao.trim().toLowerCase()
  const found = existentes.find(
    (c) =>
      c.descricao.trim().toLowerCase() === alvo &&
      (c.categoriaPai?.id ?? undefined) === (categoriaPaiId ?? undefined),
  )
  if (found) return { id: found.id, created: false }

  const { id } = await createCategoria(descricao, categoriaPaiId)
  existentes.push(
    categoriaPaiId != null
      ? { id, descricao, categoriaPai: { id: categoriaPaiId } }
      : { id, descricao },
  )
  return { id, created: true }
}
