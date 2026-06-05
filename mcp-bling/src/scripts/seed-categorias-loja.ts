/**
 * Taxonomia de LOJA GERAL (DropChina vende além de impressão: eletrônicos,
 * eletrodomésticos, beleza, mobilidade elétrica, 3D, etc.). Derivada do catálogo
 * real do Mercado Livre (202 anúncios auditados via mcp-meli).
 *
 * Idempotente e aditivo: mantém as 12 categorias de impressão e cria as demais.
 *
 *   npm run seed:categorias-loja -- --dry
 *   npm run seed:categorias-loja
 */
import { listCategorias, ensureCategoria } from '../api/categorias.js'

const dry = process.argv.includes('--dry')

// Lista completa da loja (impressão + linhas novas). Existentes são puladas.
const CATEGORIAS = [
  // impressão (já existem)
  'Impressoras',
  'Cartuchos de Toner',
  'Cartuchos de Tinta',
  'Refil de Toner',
  'Refil de Tinta',
  'Cilindros',
  'Peças e Componentes',
  'Papel Fotográfico',
  'Etiquetas e Bobinas',
  'Ribbon',
  'Scanner',
  'Informática',
  // linhas novas (do catálogo ML)
  'Papéis para Impressão',
  'Impressão 3D',
  'Áudio e Fones',
  'Eletrodomésticos e Cozinha',
  'Suportes e Acessórios',
  'Mobilidade Elétrica',
  'Carregadores e Energia',
  'Beleza e Cuidado Pessoal',
  'Periféricos PC',
  'Computadores e Componentes',
  'Embalagem e Etiquetagem',
  'Fitness e Esporte',
  'Monitores',
  'Conectividade e Redes',
  'Saúde e Suplementos',
  'Outros',
  // linhas do Fujioka (cliente sourcing — vende/pode vender)
  'Ar Condicionado e Climatização',
  'Smartwatches',
  'TV e Vídeo',
  'Câmeras e Drones',
  'Notebooks',
  'Nobreak e Estabilizador',
  'Armazenamento',
  'Projetores',
  'Games e Linha Gamer',
]

async function main() {
  console.log(`\n📋 ${CATEGORIAS.length} categorias na taxonomia de loja.`)
  if (dry) console.log('🧪 DRY RUN — nada será criado.')

  const existentes = await listCategorias()
  console.log(`🔎 ${existentes.length} categorias já existem no Bling.\n`)

  let criadas = 0
  let jaExistiam = 0
  for (const descricao of CATEGORIAS) {
    const found = existentes.find(
      (c) => c.descricao.trim().toLowerCase() === descricao.trim().toLowerCase(),
    )
    if (found) {
      console.log(`  ✓ já existe: ${descricao} (id ${found.id})`)
      jaExistiam += 1
      continue
    }
    if (dry) {
      console.log(`  + criaria:  ${descricao}`)
      criadas += 1
      continue
    }
    const { id } = await ensureCategoria(descricao, existentes)
    console.log(`  ✅ criada:   ${descricao} (id ${id})`)
    criadas += 1
  }

  const verbo = dry ? '(dry) ' : ''
  console.log(`\n✅ ${verbo}Resumo: ${criadas} ${dry ? 'a criar' : 'criadas'}, ${jaExistiam} já existiam.\n`)
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
