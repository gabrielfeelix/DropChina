/** TEMP: exporta peso bruto + dimensões dos produtos do Bling p/ catalogo/pesos-bling.json */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { listProdutos, getProduto } from '../api/produtos.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../../../catalogo/pesos-bling.json')

async function main() {
  const all: any[] = []
  let pagina = 1
  for (;;) {
    const res: any = await listProdutos({ pagina, limite: 100 } as any)
    const page = res?.data ?? res ?? []
    all.push(...page)
    if (!page.length || page.length < 100) break
    pagina++
    if (pagina > 5) break
  }
  console.log(`Listados: ${all.length}`)

  const out: Record<string, any> = {}
  let comPeso = 0, semPeso = 0, first = true
  for (const p of all) {
    const det: any = await getProduto(p.id)
    const d = det?.data ?? det
    if (first) { console.log('RAW keys 1o produto:', Object.keys(d)); console.log('  pesoBruto=', d.pesoBruto, 'pesoLiquido=', d.pesoLiquido, 'dimensoes=', JSON.stringify(d.dimensoes)); first = false }
    const codigo = d.codigo ?? p.codigo
    const pesoBruto = Number(d.pesoBruto) || 0
    const pesoLiquido = Number(d.pesoLiquido) || 0
    out[codigo] = {
      pesoBruto, pesoLiquido,
      dim: d.dimensoes ? { l: d.dimensoes.largura, a: d.dimensoes.altura, p: d.dimensoes.profundidade, u: d.dimensoes.unidadeMedida } : null,
      nome: (d.nome || '').slice(0, 50),
    }
    if (pesoBruto > 0) comPeso++; else semPeso++
  }
  writeFileSync(OUT, JSON.stringify(out, null, 2))
  console.log(`\nCom pesoBruto>0: ${comPeso}  ·  sem: ${semPeso}  ·  total: ${all.length}`)
  console.log(`Escrito: ${OUT}`)
}

main().catch((e) => { console.error('ERRO:', e instanceof Error ? e.message : e); process.exit(1) })
