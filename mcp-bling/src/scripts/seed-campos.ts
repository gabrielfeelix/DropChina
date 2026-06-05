/**
 * Cria os campos customizados de produto (taxonomia interna de compatibilidade).
 * Idempotente: roda quantas vezes quiser sem duplicar.
 *
 *   npm run seed:campos -- --dry   # mostra o que faria
 *   npm run seed:campos            # cria o que faltar
 */
import { listCampos, ensureCampo, TIPO, type CampoSpec } from '../api/campos-customizados.js'

const dry = process.argv.includes('--dry')

const CAMPOS: CampoSpec[] = [
  {
    nome: 'Marca Compatível',
    tipoCampoId: TIPO.lista,
    opcoes: ['HP', 'Brother', 'Canon', 'Epson', 'Ricoh', 'Kyocera', 'Samsung', 'Lexmark', 'Pantum', 'Xerox', 'Zebra', 'Argox', 'Elgin'],
  },
  { nome: 'Modelos Compatíveis', tipoCampoId: TIPO.textoLongo },
  {
    nome: 'Tipo de Suprimento',
    tipoCampoId: TIPO.lista,
    opcoes: ['Toner', 'Tinta', 'Refil', 'Cilindro', 'Peça', 'Papel', 'Etiqueta', 'Ribbon'],
  },
  { nome: 'Rendimento (páginas)', tipoCampoId: TIPO.inteiro },
  {
    nome: 'Cor',
    tipoCampoId: TIPO.lista,
    opcoes: ['Preto', 'Ciano', 'Magenta', 'Amarelo', 'Color'],
  },
]

async function main() {
  console.log(`\n📋 ${CAMPOS.length} campos customizados na lista (módulo Produtos).`)
  if (dry) console.log('🧪 DRY RUN — nada será criado.\n')

  const existentes = await listCampos()
  console.log(`🔎 ${existentes.length} campos customizados já existem no módulo.\n`)

  let criados = 0
  let jaExistiam = 0

  for (const spec of CAMPOS) {
    const found = existentes.find(
      (c) => c.nome.trim().toLowerCase() === spec.nome.trim().toLowerCase(),
    )
    if (found) {
      console.log(`  ✓ já existe: ${spec.nome} (id ${found.id})`)
      jaExistiam += 1
      continue
    }
    if (dry) {
      console.log(`  + criaria:  ${spec.nome} [${spec.opcoes ? 'lista: ' + spec.opcoes.length + ' opções' : 'tipo ' + spec.tipoCampoId}]`)
      criados += 1
      continue
    }
    const { id } = await ensureCampo(spec, existentes)
    console.log(`  ✅ criado:   ${spec.nome} (id ${id})`)
    criados += 1
  }

  const verbo = dry ? '(dry) ' : ''
  console.log(`\n✅ ${verbo}Resumo: ${criados} ${dry ? 'a criar' : 'criados'}, ${jaExistiam} já existiam.\n`)
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
