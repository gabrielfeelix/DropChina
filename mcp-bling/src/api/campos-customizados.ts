import { withBling } from './client.js'

/**
 * Campos customizados de produto. Modelam a taxonomia interna de compatibilidade
 * (marca real vs "compatível com X"), que o Bling NÃO gera sozinho — os atributos
 * obrigatórios do ML (Marca/Modelo/Cor) são gerados pelo Bling ao vincular a
 * categoria do ML, então não os duplicamos aqui.
 */

/** Módulo "Produtos" no Bling (descoberto via getModules). */
export const MODULO_PRODUTOS = 98309

/** Tipos de campo (via getTypes). */
export const TIPO = {
  inteiro: 1,
  decimal: 2,
  lista: 3,
  texto: 4,
  textoLongo: 5,
  logico: 6,
  data: 7,
} as const

export interface CampoCustomizado {
  id: number
  nome: string
}

/** Lista os campos customizados de um módulo (paginando). */
export async function listCampos(idModulo = MODULO_PRODUTOS): Promise<CampoCustomizado[]> {
  const all: CampoCustomizado[] = []
  let pagina = 1
  const limite = 100
  for (;;) {
    const res = await withBling((b) =>
      b.camposCustomizados.findByModule({ idModulo, pagina, limite } as any),
    )
    const page = (res.data ?? []) as CampoCustomizado[]
    all.push(...page)
    if (page.length < limite) break
    pagina += 1
  }
  return all
}

export interface CampoSpec {
  nome: string
  tipoCampoId: number
  /** Para tipo Lista: rótulos das opções. */
  opcoes?: string[]
}

/** Cria um campo customizado no módulo Produtos. */
export async function createCampo(spec: CampoSpec): Promise<{ id: number }> {
  const body: Record<string, unknown> = {
    nome: spec.nome,
    modulo: { id: MODULO_PRODUTOS },
    tipoCampo: { id: spec.tipoCampoId },
  }
  if (spec.opcoes?.length) {
    // O Bling atribui os ids das opções — enviar só `nome` (apesar da interface
    // do SDK pedir `id`, mandar id provoca erro de validação no Bling).
    body.opcoes = spec.opcoes.map((nome) => ({ nome }))
  }
  const res = await withBling((b) => b.camposCustomizados.create(body as any))
  return res.data
}

/**
 * Idempotente: cria o campo se não existir (match por nome, case-insensitive).
 * Recebe a lista já carregada para não relistar a cada item.
 */
export async function ensureCampo(
  spec: CampoSpec,
  existentes: CampoCustomizado[],
): Promise<{ id: number; created: boolean }> {
  const alvo = spec.nome.trim().toLowerCase()
  const found = existentes.find((c) => c.nome.trim().toLowerCase() === alvo)
  if (found) return { id: found.id, created: false }
  const { id } = await createCampo(spec)
  return { id, created: true }
}
