/**
 * Carga do catálogo do Mercado Livre (auditado em mcp-meli/out/catalogo.json)
 * para o Bling, via upsert idempotente por SKU. NÃO cria vínculo com canal →
 * não toca os anúncios do ML. Produto nasce limpo no Bling (fonte de verdade).
 *
 *   npm run load:meli -- --dry    # mostra o que faria (não escreve)
 *   npm run load:meli             # carrega (upsert por codigo)
 *
 * Itens SEM SKU real (codigo = MLB) são PULADOS e listados — precisam de SKU
 * definido antes (no ML ou manualmente) pra não duplicar cadastro.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { listCategorias } from '../api/categorias.js'
import { upsertProduto, type ProdutoInput } from '../api/produtos.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CATALOGO = join(__dirname, '..', '..', '..', 'mcp-meli', 'out', 'catalogo.json')
const dry = process.argv.includes('--dry')

interface ItemMeli {
  mlb: string
  titulo: string
  sku: string | null
  skuEhMlb: boolean
  marca: string | null
  gtin: string | null
  preco?: number
  categoriaNome?: string
}

// Mapeia o path de categoria do ML → NOME de categoria no Bling (1ª regra que casa).
const REGRAS: [RegExp, string][] = [
  [/Toners|Cartuchos de Toner/i, 'Cartuchos de Toner'],
  [/Cartuchos de Tinta/i, 'Cartuchos de Tinta'],
  [/Chips para Toner|Cilindros para Toner|Correias|Cabe.a de Impress|> Peças/i, 'Peças e Componentes'],
  [/Impressão 3D|Filamentos/i, 'Impressão 3D'],
  [/Impressoras/i, 'Impressoras'],
  [/Papéis para Impressão|Papel/i, 'Papéis para Impressão'],
  [/Leitores de Cartão/i, 'Periféricos PC'],
  [/Leitores e Scanners|Scanner/i, 'Scanner'],
  [/Monitores/i, 'Monitores'],
  [/Placas de Vídeo|Gabinetes|Componentes para PC|Mini PCs|PC de Mesa/i, 'Computadores e Componentes'],
  [/Mouses e Teclados|Teclados|Periféricos para PC/i, 'Periféricos PC'],
  [/Suportes e Mesas|Acessórios para Notebook|PC Gaming/i, 'Suportes e Acessórios'],
  [/Fones|Áudio/i, 'Áudio e Fones'],
  [/Cabos|Adaptadores/i, 'Cabos e Adaptadores'],
  [/Carregadores/i, 'Carregadores e Energia'],
  [/Antenas|Conectividade e Redes/i, 'Conectividade e Redes'],
  [/Triciclos|Bicicletas Elétricas|Patinetes|Scooters|Moto Elétrica|Elétricos/i, 'Mobilidade Elétrica'],
  [/Seladoras|Embalagem e Logística|Rotulagem/i, 'Embalagem e Etiquetagem'],
  [/Halteres|Hand Grips|Fitness|Ciclismo/i, 'Fitness e Esporte'],
  [/Máquinas de Cortar Cabelo|Escovas Elétricas|Artefatos para Cabelo|Beleza/i, 'Beleza e Cuidado Pessoal'],
  [/Balanças|Afiadores|Bomba|Moedores|Lava-Louças|Escumadeiras|Pulverizadores|Cozinha|Eletrodomésticos/i, 'Eletrodomésticos e Cozinha'],
  [/Suplementos|Saúde/i, 'Saúde e Suplementos'],
  [/Livros|Figurinhas|Media Streaming|Brinquedos/i, 'Outros'],
]

function categoriaBling(path: string | undefined): string {
  if (!path) return 'Outros'
  return REGRAS.find(([re]) => re.test(path))?.[1] ?? 'Outros'
}

/** Saneia GTIN: pega o 1º valor, exige 8/12/13/14 dígitos. Senão, omite. */
function sanitizeGtin(gtin: string | null): string | undefined {
  if (!gtin) return undefined
  const first = gtin.split(/[,;\s]/)[0].trim()
  return /^\d{8}$|^\d{12,14}$/.test(first) ? first : undefined
}

async function main() {
  const itens = JSON.parse(readFileSync(CATALOGO, 'utf8')) as ItemMeli[]
  console.log(`\n📦 ${itens.length} itens no catálogo do ML.`)
  if (dry) console.log('🧪 DRY RUN — nada será escrito no Bling.')

  const cats = await listCategorias()
  const idPorNome = new Map(cats.map((c) => [c.descricao.trim().toLowerCase(), c.id]))

  const comSku = itens.filter((i) => !i.skuEhMlb && i.sku)
  const semSku = itens.filter((i) => i.skuEhMlb || !i.sku)

  console.log(`\n🔑 ${comSku.length} com SKU real (serão carregados), ${semSku.length} sem SKU (PULADOS).`)

  // distribuição por categoria (dos que serão carregados)
  const porCat = new Map<string, number>()
  for (const i of comSku) {
    const nome = categoriaBling(i.categoriaNome)
    porCat.set(nome, (porCat.get(nome) ?? 0) + 1)
  }
  console.log('\n📂 Distribuição por categoria Bling:')
  ;[...porCat.entries()].sort((a, b) => b[1] - a[1]).forEach(([k, n]) => {
    const ok = idPorNome.has(k.toLowerCase()) ? '' : '  ⚠️ categoria não existe no Bling!'
    console.log(`   ${n.toString().padStart(3)}  ${k}${ok}`)
  })

  let criados = 0
  let atualizados = 0
  let erros = 0
  let gtinDropados = 0

  if (!dry) {
    console.log('\n⏳ Carregando (upsert por SKU)...')
    for (const i of comSku) {
      const nomeCat = categoriaBling(i.categoriaNome)
      const categoriaId = idPorNome.get(nomeCat.toLowerCase())
      const input: ProdutoInput = {
        nome: i.titulo,
        codigo: i.sku!,
        preco: i.preco,
        unidade: 'UN',
        marca: i.marca ?? undefined,
        gtin: sanitizeGtin(i.gtin),
        categoriaId,
      }
      try {
        const r = await upsertProduto(input)
        r.created ? criados++ : atualizados++
      } catch (err) {
        // GTIN inválido (prefixo não-GS1 etc.): retenta SEM gtin pra não perder o produto.
        if (input.gtin) {
          try {
            const r = await upsertProduto({ ...input, gtin: undefined })
            gtinDropados++
            r.created ? criados++ : atualizados++
            continue
          } catch {
            /* cai no erro abaixo */
          }
        }
        erros++
        console.error(`   ❌ ${i.sku} (${i.titulo.slice(0, 40)}): ${err instanceof Error ? err.message : err}`)
      }
    }
    console.log(`\n✅ Carga: ${criados} criados, ${atualizados} atualizados, ${erros} erros, ${gtinDropados} GTIN inválido dropado.`)
  }

  console.log(`\n📝 ${semSku.length} itens SEM SKU (puladas — definir SKU antes):`)
  semSku.forEach((i) => console.log(`   ${i.mlb} | ${i.titulo.slice(0, 60)}`))
  console.log('')
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
