/** Descartável: checa se a API v3 honra os filtros de data em produtos.get. */
import { withBling } from '../api/client.js'

const casos: any[] = [
  { dataInclusaoInicial: '2026-08-03' },
  { dataAlteracaoInicial: '2030-01-01' },
  { dataAlteracaoInicial: '2026-07-31', dataAlteracaoFinal: '2026-08-03' },
  { dataAlteracaoInicial: '2026-01-01', dataAlteracaoFinal: '2026-01-02' },
  { dataInclusaoInicial: '2026-08-01', dataInclusaoFinal: '2026-08-03' },
  {},
]

for (const p of casos) {
  try {
    const r: any = await withBling((b) => b.produtos.get({ ...p, pagina: 1, limite: 100 } as any))
    console.log('RESULTADO', JSON.stringify(p), '->', (r?.data ?? []).length)
  } catch (e: any) {
    console.log('RESULTADO', JSON.stringify(p), '-> ERRO', String(e?.message ?? e).slice(0, 200))
  }
}
