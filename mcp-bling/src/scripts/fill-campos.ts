/**
 * Preenche os campos customizados de compatibilidade nos produtos já carregados,
 * a partir do catálogo do ML (mcp-meli/out/catalogo.json). Idempotente (update).
 *
 *   npm run fill:campos -- --dry
 *   npm run fill:campos
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { withBling } from '../api/client.js'
import { findProdutoByCodigo, updateProduto } from '../api/produtos.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CATALOGO = join(__dirname, '..', '..', '..', 'mcp-meli', 'out', 'catalogo.json')
const dry = process.argv.includes('--dry')

const ID = {
  modelos: 8612935, // Texto Longo
  rendimento: 8613219, // Inteiro
  cor: 8613220, // Lista
  tipo: 8613217, // Lista (Tipo de Suprimento)
  marcaCompat: 8613218, // Lista
}

interface Item {
  titulo: string
  sku: string | null
  skuEhMlb: boolean
  modeloCompat?: string | null
  cor?: string | null
  rendimento?: number | null
  categoriaNome?: string
}

/** Carrega o mapa nome(lowercase)→id das opções de um campo Lista. */
async function opcoesDe(idCampo: number): Promise<Map<string, number>> {
  const f: any = await withBling((b) => b.camposCustomizados.find({ idCampoCustomizado: idCampo } as any))
  const m = new Map<string, number>()
  for (const o of f.data?.opcoes ?? []) if (o.id) m.set(String(o.nome).trim().toLowerCase(), o.id)
  return m
}

const MARCAS = ['HP', 'Brother', 'Canon', 'Epson', 'Ricoh', 'Kyocera', 'Samsung', 'Lexmark', 'Pantum', 'Xerox', 'Zebra', 'Argox', 'Elgin']

function tipoDe(path = ''): string | null {
  if (/Cartuchos de Toner|Toners/i.test(path)) return 'Toner'
  if (/Cartuchos de Tinta/i.test(path)) return 'Tinta'
  if (/Refil/i.test(path)) return 'Refil'
  if (/Cilindro/i.test(path)) return 'Cilindro'
  if (/Peças|Chips|Correias|Cabeça de Impress/i.test(path)) return 'Peça'
  if (/Papéis|Papel/i.test(path)) return 'Papel'
  if (/Etiquetas/i.test(path)) return 'Etiqueta'
  if (/Ribbon/i.test(path)) return 'Ribbon'
  return null
}

function corDe(cor?: string | null): string | null {
  if (!cor) return null
  const c = cor.toLowerCase()
  if (/preto|black/.test(c)) return 'Preto'
  if (/ciano|cyan/.test(c)) return 'Ciano'
  if (/magenta/.test(c)) return 'Magenta'
  if (/amarelo|yellow/.test(c)) return 'Amarelo'
  if (/color|colorido|cmyk|tricolor/.test(c)) return 'Color'
  return null
}

async function main() {
  const itens = (JSON.parse(readFileSync(CATALOGO, 'utf8')) as Item[]).filter((i) => i.sku && !i.skuEhMlb)
  console.log(`\n📦 ${itens.length} produtos com SKU.`)
  if (dry) console.log('🧪 DRY RUN — nada será escrito.')

  const [optCor, optTipo, optMarca] = await Promise.all([opcoesDe(ID.cor), opcoesDe(ID.tipo), opcoesDe(ID.marcaCompat)])

  const stat = { modelos: 0, rendimento: 0, cor: 0, tipo: 0, marca: 0 }
  let comAlgo = 0
  let atualizados = 0
  let erros = 0

  for (const i of itens) {
    const campos: { idCampoCustomizado: number; valor: string }[] = []

    if (i.modeloCompat) { campos.push({ idCampoCustomizado: ID.modelos, valor: i.modeloCompat.slice(0, 250) }); stat.modelos++ }
    if (i.rendimento) { campos.push({ idCampoCustomizado: ID.rendimento, valor: String(i.rendimento) }); stat.rendimento++ }

    const cor = corDe(i.cor)
    if (cor && optCor.has(cor.toLowerCase())) { campos.push({ idCampoCustomizado: ID.cor, valor: String(optCor.get(cor.toLowerCase())) }); stat.cor++ }

    const tipo = tipoDe(i.categoriaNome)
    if (tipo && optTipo.has(tipo.toLowerCase())) { campos.push({ idCampoCustomizado: ID.tipo, valor: String(optTipo.get(tipo.toLowerCase())) }); stat.tipo++ }

    const marca = MARCAS.find((m) => new RegExp(`\\b${m}\\b`, 'i').test(`${i.titulo} ${i.modeloCompat ?? ''}`))
    if (marca && optMarca.has(marca.toLowerCase())) { campos.push({ idCampoCustomizado: ID.marcaCompat, valor: String(optMarca.get(marca.toLowerCase())) }); stat.marca++ }

    if (!campos.length) continue
    comAlgo++
    if (dry) continue

    try {
      const p = await findProdutoByCodigo(i.sku!)
      if (!p?.id) { erros++; continue }
      await updateProduto(p.id, { camposCustomizados: campos })
      atualizados++
    } catch (err) {
      erros++
      console.error(`   ❌ ${i.sku}: ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log(`\n📊 Preenchimentos: Modelos ${stat.modelos}, Rendimento ${stat.rendimento}, Cor ${stat.cor}, Tipo ${stat.tipo}, Marca Compat ${stat.marca}`)
  console.log(`   ${comAlgo} produtos com ao menos 1 campo.`)
  if (!dry) console.log(`\n✅ ${atualizados} atualizados, ${erros} erros.`)
  console.log('')
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
