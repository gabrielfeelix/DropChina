/** Descartável: descobre o filtro implícito do produtos.get (quantos produtos existem de verdade). */
import { withBling } from '../api/client.js'

async function contar(params: any) {
  let total = 0
  for (let pagina = 1; pagina <= 20; pagina++) {
    const res: any = await withBling((b) => b.produtos.get({ ...params, pagina, limite: 100 } as any))
    const n = (res?.data ?? []).length
    total += n
    if (n < 100) break
  }
  return total
}

for (const p of [{}, { criterio: 1 }, { criterio: 2 }, { criterio: 3 }, { criterio: 4 }, { criterio: 5 }, { tipo: 'T' }]) {
  try {
    console.log('RESULTADO', JSON.stringify(p), '->', await contar(p))
  } catch (e: any) {
    console.log('RESULTADO', JSON.stringify(p), '-> ERRO', String(e?.message ?? e).slice(0, 120))
  }
}
