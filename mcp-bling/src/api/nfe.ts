import { withBling } from './client.js'

/**
 * NF-e — somente LEITURA por enquanto. Emitir/cancelar nota é operação fiscal
 * sensível (fica para uma fase posterior, com confirmação e ambiente validado).
 */

export interface NfeResumo {
  id?: number
  tipo?: number
  situacao?: number
  numero?: string
  dataEmissao?: string
  contato?: { nome: string; numeroDocumento: string }
}

/** Lista NF-e (1 página). Filtros opcionais por situacao, tipo, intervalo de emissão. */
export async function listNfes(
  params: {
    pagina?: number
    limite?: number
    situacao?: number
    tipo?: number
    dataEmissaoInicial?: string
    dataEmissaoFinal?: string
  } = {},
): Promise<NfeResumo[]> {
  const res = await withBling((b) =>
    b.nfes.get({ pagina: 1, limite: 50, ...params } as any),
  )
  return (res.data ?? []) as NfeResumo[]
}

/** Detalhe de uma NF-e por id. */
export async function getNfe(idNotaFiscal: number): Promise<unknown> {
  const res = await withBling((b) => b.nfes.find({ idNotaFiscal } as any))
  return res.data
}
