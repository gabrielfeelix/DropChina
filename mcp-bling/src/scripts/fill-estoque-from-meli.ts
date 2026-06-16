/**
 * Preenche o ESTOQUE no Bling a partir do estoque de referência do Mercado Livre
 * (available_quantity, capturado em mcp-meli/out/catalogo.json como `estoqueRef`).
 *
 * Por que existe: a carga de catálogo (load-from-meli) NÃO trouxe estoque — na API
 * do Bling estoque é endpoint separado do produto. Resultado: 136 produtos com
 * saldo 0. Este script casa por `codigo` (= SKU do ML) e grava o saldo via operação
 * de BALANÇO ('B' = define saldo absoluto), no depósito padrão.
 *
 *   npm run fill:estoque -- --dry   # mostra a tabela casada, NÃO escreve
 *   npm run fill:estoque            # grava saldo (balanço) no depósito padrão
 *
 * SEGURANÇA: produto SEM vínculo de canal não repercute no ML/Shopify. Gravar
 * saldo aqui é local ao Bling. A sync pros canais só acontece depois, no go-live.
 *
 * SKU repetido (vários anúncios, mesmo SKU) → usa o MAIOR available_quantity
 * (não soma, pra não inflar). Estoque físico é um número só por SKU.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { withBling } from '../api/client.js'
import { findProdutoByCodigo } from '../api/produtos.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CATALOGO = join(__dirname, '..', '..', '..', 'mcp-meli', 'out', 'catalogo.json')
const dry = process.argv.includes('--dry')

interface ItemMeli {
  mlb: string
  titulo: string
  sku: string | null
  skuEhMlb: boolean
  estoqueRef?: number
  status?: string
}

async function depositoPadraoId(): Promise<{ id: number; descricao: string }> {
  const res = await withBling((b) => b.depositos.get({ limite: 100 } as any))
  const deps = (res.data ?? []) as { id: number; descricao: string; padrao: boolean }[]
  const padrao = deps.find((d) => d.padrao) ?? deps[0]
  if (!padrao) throw new Error('Nenhum depósito encontrado no Bling.')
  return { id: padrao.id, descricao: padrao.descricao }
}

async function main() {
  const itens = JSON.parse(readFileSync(CATALOGO, 'utf8')) as ItemMeli[]

  // Map SKU real -> maior estoqueRef encontrado (consolida anúncios do mesmo SKU)
  const estoquePorSku = new Map<string, number>()
  const dupes = new Map<string, number>()
  for (const i of itens) {
    if (i.skuEhMlb || !i.sku) continue
    const q = Math.max(0, Math.floor(i.estoqueRef ?? 0))
    if (estoquePorSku.has(i.sku)) dupes.set(i.sku, (dupes.get(i.sku) ?? 1) + 1)
    estoquePorSku.set(i.sku, Math.max(estoquePorSku.get(i.sku) ?? 0, q))
  }

  console.log(`\n📦 ${itens.length} itens no snapshot ML. ${estoquePorSku.size} SKUs únicos com SKU real.`)
  if (dupes.size) console.log(`🔁 ${dupes.size} SKUs com múltiplos anúncios (usado o maior saldo).`)
  if (dry) console.log('🧪 DRY RUN — nada será escrito.\n')

  const { id: depId, descricao: depNome } = await depositoPadraoId()
  console.log(`🏬 Depósito padrão: "${depNome}" (id ${depId})\n`)

  let casados = 0
  let semProduto = 0
  let escritos = 0
  let erros = 0
  let somaSaldo = 0
  const naoEncontrados: string[] = []

  const linhas: string[] = []
  for (const [sku, qtd] of estoquePorSku) {
    const prod = await findProdutoByCodigo(sku)
    if (!prod?.id) {
      semProduto++
      naoEncontrados.push(sku)
      continue
    }
    casados++
    somaSaldo += qtd
    const antes = prod.estoque?.saldoVirtualTotal ?? 0
    linhas.push(`   ${sku.padEnd(28)} ${String(antes).padStart(4)} → ${String(qtd).padStart(4)}  ${prod.nome?.slice(0, 40) ?? ''}`)

    if (!dry) {
      try {
        await withBling((b) =>
          b.estoques.create({
            produto: { id: prod.id! },
            deposito: { id: depId },
            operacao: 'B', // Balanço = define saldo absoluto
            quantidade: qtd,
            observacoes: 'Baseline ML available_quantity (snapshot mcp-meli)',
          } as any),
        )
        escritos++
      } catch (err) {
        erros++
        console.error(`   ❌ ${sku}: ${err instanceof Error ? err.message : err}`)
      }
    }
  }

  console.log('   SKU                          antes →  novo  produto')
  console.log(linhas.join('\n'))
  console.log(`\n📊 Casados Bling: ${casados} | sem produto no Bling: ${semProduto} | soma saldo a aplicar: ${somaSaldo}`)
  if (naoEncontrados.length)
    console.log(`\n⚠️ SKUs do ML sem produto no Bling (${naoEncontrados.length}): ${naoEncontrados.join(', ')}`)
  if (!dry) console.log(`\n✅ Saldo gravado: ${escritos} ok, ${erros} erros.`)
  else console.log('\n👉 Rode sem --dry para gravar.')
  console.log('')
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
