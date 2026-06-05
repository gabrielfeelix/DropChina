/**
 * Semeia as 12 categorias oficiais (categorias_marcas.json) no Bling — idempotente.
 *
 *   npm run seed:categorias            # cria o que faltar
 *   npm run seed:categorias -- --dry   # só mostra o que faria, sem criar
 *
 * Conforme a arquitetura (01_DropChina...md): cada linha-tipo da planilha vira UMA
 * categoria no Bling. A MARCA não vira categoria — vira atributo/tag do produto.
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { listCategorias, ensureCategoria } from '../api/categorias.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const JSON_PATH = resolve(__dirname, '../../categorias_marcas.json')

interface Taxonomia {
  categorias: { categoria: string; marcas: string[] }[]
}

const dryRun = process.argv.includes('--dry')

async function main() {
  const raw = await readFile(JSON_PATH, 'utf8')
  const taxonomia = JSON.parse(raw) as Taxonomia
  const nomes = taxonomia.categorias.map((c) => c.categoria)

  console.log(`📋 ${nomes.length} categorias na taxonomia oficial.`)
  if (dryRun) console.log('🧪 DRY RUN — nada será criado.\n')

  const existentes = await listCategorias()
  console.log(`🔎 ${existentes.length} categorias já existem no Bling.\n`)

  let criadas = 0
  let jaExistiam = 0

  for (const nome of nomes) {
    const jaTem = existentes.some(
      (c) => c.descricao.trim().toLowerCase() === nome.trim().toLowerCase(),
    )

    if (jaTem) {
      console.log(`  ✓ já existe: ${nome}`)
      jaExistiam++
      continue
    }

    if (dryRun) {
      console.log(`  + criaria:  ${nome}`)
      criadas++
      continue
    }

    const { id, created } = await ensureCategoria(nome, existentes)
    if (created) {
      console.log(`  ✅ criada:   ${nome} (id ${id})`)
      existentes.push({ id, descricao: nome })
      criadas++
    } else {
      console.log(`  ✓ já existe: ${nome} (id ${id})`)
      jaExistiam++
    }
  }

  console.log(
    `\n${dryRun ? '🧪 (dry) ' : '✅ '}Resumo: ${criadas} ${dryRun ? 'a criar' : 'criadas'}, ${jaExistiam} já existiam.`,
  )
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
