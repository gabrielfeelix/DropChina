import { withBling } from './client.js'

/**
 * Camada de produtos sobre o SDK. Regras do projeto:
 * - `codigo` (SKU) é a chave de idempotência e o vínculo com os canais. Nunca
 *   usar o id do anúncio (MLB...) como `codigo`.
 * - Escrita (create/update) é sempre explícita. Criar produto NOVO (sem vínculo
 *   de canal) não repercute no Mercado Livre; só toca canal quem está vinculado
 *   + com sync ligada (config de painel, feita no go-live).
 */

export interface ProdutoResumo {
  id?: number
  nome: string
  codigo?: string
  preco?: number
  tipo?: string
  situacao?: string
  formato?: string
  estoque?: { saldoVirtualTotal?: number }
}

/** Campos aceitos para criar/atualizar. Mapeados para o payload do Bling. */
export interface ProdutoInput {
  nome?: string
  codigo?: string
  preco?: number
  tipo?: 'P' | 'S' | 'N'
  situacao?: 'A' | 'I'
  formato?: 'S' | 'V' | 'E'
  unidade?: string
  gtin?: string
  marca?: string
  categoriaId?: number
  pesoBruto?: number
  pesoLiquido?: number
  descricaoCurta?: string
  descricaoComplementar?: string
  /** Dimensões da embalagem (cm). */
  largura?: number
  altura?: number
  profundidade?: number
  /** URLs públicas de imagem. */
  imagens?: string[]
  /** Fiscais — agrupados em `tributacao`. */
  ncm?: string
  origem?: number
  cest?: string
}

/** Monta o body do Bling a partir do input achatado. Só inclui o que veio. */
function montarBody(input: ProdutoInput): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  if (input.nome != null) body.nome = input.nome
  if (input.codigo != null) body.codigo = input.codigo
  if (input.preco != null) body.preco = input.preco
  if (input.tipo != null) body.tipo = input.tipo
  if (input.situacao != null) body.situacao = input.situacao
  if (input.formato != null) body.formato = input.formato
  if (input.unidade != null) body.unidade = input.unidade
  if (input.gtin != null) body.gtin = input.gtin
  if (input.marca != null) body.marca = input.marca
  if (input.categoriaId != null) body.categoria = { id: input.categoriaId }
  if (input.pesoBruto != null) body.pesoBruto = input.pesoBruto
  if (input.pesoLiquido != null) body.pesoLiquido = input.pesoLiquido
  if (input.descricaoCurta != null) body.descricaoCurta = input.descricaoCurta
  if (input.descricaoComplementar != null) body.descricaoComplementar = input.descricaoComplementar

  // dimensões (cm = unidadeMedida 2)
  if (input.largura != null || input.altura != null || input.profundidade != null) {
    body.dimensoes = {
      largura: input.largura,
      altura: input.altura,
      profundidade: input.profundidade,
      unidadeMedida: 2,
    }
  }

  // imagens externas (Bling referencia a URL). Exige https; máx ~6.
  // OBS: só persiste se a conta estiver em "URL de Imagens Externas" (config painel).
  if (input.imagens?.length) {
    const externas = input.imagens
      .map((u) => u.replace(/^http:/, 'https:'))
      .filter((u) => /^https:\/\//.test(u))
      .slice(0, 6)
      .map((link) => ({ link }))
    if (externas.length) body.midia = { video: { url: '' }, imagens: { externas } }
  }

  const trib: Record<string, unknown> = {}
  if (input.ncm != null) trib.ncm = input.ncm
  if (input.origem != null) trib.origem = input.origem
  if (input.cest != null) trib.cest = input.cest
  if (Object.keys(trib).length) body.tributacao = trib

  return body
}

/** Lista produtos (1 página). Filtros opcionais por codigo, nome, categoria. */
export async function listProdutos(
  params: { pagina?: number; limite?: number; codigo?: string; nome?: string; idCategoria?: number } = {},
): Promise<ProdutoResumo[]> {
  const res = await withBling((b) =>
    b.produtos.get({ pagina: 1, limite: 100, ...params } as any),
  )
  return (res.data ?? []) as ProdutoResumo[]
}

/** Detalhe completo de um produto por id. */
export async function getProduto(idProduto: number): Promise<unknown> {
  const res = await withBling((b) => b.produtos.find({ idProduto } as any))
  return res.data
}

/** Busca exata por `codigo` (SKU). Retorna o produto ou null. Base da idempotência. */
export async function findProdutoByCodigo(codigo: string): Promise<ProdutoResumo | null> {
  const res = await withBling((b) => b.produtos.get({ codigo, limite: 100 } as any))
  const arr = (res.data ?? []) as ProdutoResumo[]
  // O filtro `codigo` da API pode trazer correspondência parcial — exigir exata.
  return arr.find((p) => p.codigo === codigo) ?? null
}

/** Cria produto novo. Sem vínculo de canal → não repercute no ML. */
export async function createProduto(input: ProdutoInput): Promise<{ id?: number }> {
  if (!input.nome) throw new Error('nome é obrigatório para criar produto')
  const body = {
    tipo: 'P',
    situacao: 'A',
    formato: 'S',
    ...montarBody(input),
  }
  const res = await withBling((b) => b.produtos.create(body as any))
  return res.data
}

/** Atualiza produto existente por id. */
export async function updateProduto(idProduto: number, input: ProdutoInput): Promise<unknown> {
  const body = montarBody(input)
  const res = await withBling((b) => b.produtos.update({ idProduto, ...body } as any))
  return res.data
}

/**
 * Idempotente por `codigo` (SKU): atualiza se já existe, cria se não.
 * `codigo` obrigatório — é o que evita duplicar cadastro nos canais.
 */
export async function upsertProduto(
  input: ProdutoInput,
): Promise<{ id?: number; created: boolean }> {
  if (!input.codigo) throw new Error('codigo (SKU) é obrigatório para upsert idempotente')
  const existing = await findProdutoByCodigo(input.codigo)
  if (existing?.id) {
    await updateProduto(existing.id, input)
    return { id: existing.id, created: false }
  }
  const created = await createProduto(input)
  return { id: created?.id, created: true }
}
