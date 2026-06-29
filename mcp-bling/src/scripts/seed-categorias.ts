/**
 * Semeia a taxonomia oficial (categorias_marcas.json v2) no Bling — 2 níveis,
 * idempotente.
 *
 *   npm run seed:categorias            # cria o que faltar
 *   npm run seed:categorias -- --dry   # só mostra o que faria, sem criar
 *
 * Estrutura: cada DEPARTAMENTO vira uma categoria-pai; cada SUBCATEGORIA vira uma
 * categoria-filha (categoriaPai = departamento). A MARCA não vira categoria — é
 * atributo/tag do produto. Reflete a mesma taxonomia das smart collections da Shopify.
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { listCategorias, ensureCategoria } from '../api/categorias.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const JSON_PATH = resolve(__dirname, '../../categorias_marcas.json')

interface Subcategoria {
  nome: string
  tag: string
  marcas: string[]
}
interface Departamento {
  departamento: string
  handle: string
  subcategorias: Subcategoria[]
}
interface Taxonomia {
  departamentos: Departamento[]
}

const dryRun = process.argv.includes('--dry')
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

async function main() {
  const raw = await readFile(JSON_PATH, 'utf8')
  const taxonomia = JSON.parse(raw) as Taxonomia
  const deps = taxonomia.departamentos
  const nSub = deps.reduce((n, d) => n + d.subcategorias.length, 0)

  console.log(`📋 ${deps.length} departamentos · ${nSub} subcategorias na taxonomia v2.`)
  if (dryRun) console.log('🧪 DRY RUN — nada será criado.\n')

  const existentes = await listCategorias()
  console.log(`🔎 ${existentes.length} categorias já existem no Bling.\n`)

  let criadas = 0
  let jaExistiam = 0

  for (const dep of deps) {
    // 1) departamento (categoria-pai)
    let paiId: number
    const paiFound = existentes.find((c) => same(c.descricao, dep.departamento) && c.categoriaPai == null)
    if (paiFound) {
      console.log(`  ✓ depto já existe: ${dep.departamento}`)
      jaExistiam++
      paiId = paiFound.id
    } else if (dryRun) {
      console.log(`  + criaria depto:  ${dep.departamento}`)
      criadas++
      paiId = -1 // placeholder no dry-run
    } else {
      const { id } = await ensureCategoria(dep.departamento, existentes)
      console.log(`  ✅ depto criado:   ${dep.departamento} (id ${id})`)
      criadas++
      paiId = id
    }

    // 2) subcategorias (categoria-filha). Pula subcat homônima do depto.
    for (const sub of dep.subcategorias) {
      if (same(sub.nome, dep.departamento)) continue

      const subFound = existentes.find(
        (c) => same(c.descricao, sub.nome) && c.categoriaPai?.id === paiId,
      )
      if (subFound) {
        console.log(`      ✓ já existe: ${sub.nome}`)
        jaExistiam++
        continue
      }
      if (dryRun) {
        console.log(`      + criaria:  ${sub.nome}  (pai: ${dep.departamento})`)
        criadas++
        continue
      }
      const { id } = await ensureCategoria(sub.nome, existentes, paiId)
      console.log(`      ✅ criada:   ${sub.nome} (id ${id}, pai ${paiId})`)
      criadas++
    }
  }

  console.log(`\n${dryRun ? '🧪 (dry) ' : '✅ '}Resumo: ${criadas} ${dryRun ? 'a criar' : 'criadas'}, ${jaExistiam} já existiam.`)
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
