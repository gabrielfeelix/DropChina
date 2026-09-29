/**
 * Cadastra os filamentos Bambu Lab no Bling a partir de
 * catalogo/filamentos-bambu-2026-09.json + catalogo/filamentos-bambu/descricoes.md
 * (o .md é a fonte de verdade das descrições, parseado em runtime).
 *
 *   npx tsx src/scripts/criar-filamentos-bambu.ts --offline        # sem rede, imprime payloads
 *   npx tsx src/scripts/criar-filamentos-bambu.ts                  # DRY: lê o Bling, NÃO escreve
 *   npx tsx src/scripts/criar-filamentos-bambu.ts --apply          # ESCREVE no Bling
 *   flags: --only <sku>   --imagens <json {sku:[https...]}>
 *
 * Por produto: upsert por SKU -> custo (fornecedor padrão FORN-DROPCHINA, mesma
 * lógica do set-custo.ts) -> estoque inicial SÓ se o produto foi criado agora.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { withBling } from '../api/client.js'
import { findProdutoByCodigo, getProduto, upsertProduto, type ProdutoInput } from '../api/produtos.js'
import { listCategorias } from '../api/categorias.js'
import { CAT_DIR, JSON_IN, lerDescricoes, descricaoDe, type Item } from './filamentos-bambu-dados.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(CAT_DIR, 'filamentos-bambu', 'bling-result.json')

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const offline = args.includes('--offline')
const arg = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined }
const only = arg('--only')
const imagensPath = arg('--imagens')

const CATEGORIA_NOME = 'Impressão 3D'
const REF_CODIGO = 'FILAMENTO 3D 1.75 PRETO'
const FORN_CODIGO = 'FORN-DROPCHINA'
const FORN_NOME = 'Fornecedor Padrão (DropChina)'
const DEPOSITO_ESPERADO = 14888019804

async function resolverCategoria(): Promise<number> {
  const cats = await listCategorias()
  const alvo = cats.find((c) => c.descricao.trim().toLowerCase() === CATEGORIA_NOME.toLowerCase())
  if (!alvo) {
    const cand = cats.filter((c) => /filament/i.test(c.descricao)).map((c) => `${c.id}:${c.descricao}`)
    throw new Error(`Categoria "${CATEGORIA_NOME}" não encontrada. Candidatas com "Filament": ${cand.join(' | ') || '(nenhuma)'}`)
  }
  return alvo.id
}

async function resolverFiscalRef(): Promise<{ origem: number; cest?: string }> {
  const ref = await findProdutoByCodigo(REF_CODIGO)
  if (!ref?.id) throw new Error(`Produto de referência "${REF_CODIGO}" não encontrado`)
  const det: any = await getProduto(ref.id)
  const origem = det?.tributacao?.origem
  if (origem == null) throw new Error(`Referência ${REF_CODIGO} sem tributacao.origem`)
  const cest = det?.tributacao?.cest
  return { origem: Number(origem), cest: cest ? String(cest) : undefined }
}

async function depositoPadrao(): Promise<{ id: number; descricao: string }> {
  const res = await withBling((b) => b.depositos.get({ limite: 100 } as any))
  const deps = (res.data ?? []) as { id: number; descricao: string; padrao: boolean }[]
  const p = deps.find((d) => d.padrao) ?? deps[0]
  if (!p) throw new Error('Nenhum depósito encontrado no Bling.')
  return p
}

async function garantirFornecedor(): Promise<number> {
  const r: any = await withBling((b) => b.contatos.get({ pesquisa: FORN_CODIGO, limite: 100 } as any))
  const achado = (r.data ?? []).find((c: any) => c.codigo === FORN_CODIGO)
  if (achado?.id) return achado.id
  const criado: any = await withBling((b) =>
    b.contatos.create({ nome: FORN_NOME, codigo: FORN_CODIGO, tipo: 'J', situacao: 'A' } as any),
  )
  return criado.data?.id
}

/** Mesma lógica do set-custo.ts: update do registro do nosso fornecedor, senão create. */
async function gravarCusto(prodId: number, nome: string, custo: number, fornId: number): Promise<string> {
  const ex: any = await withBling((b) => b.produtosFornecedores.get({ idProduto: prodId } as any))
  const meu = (ex.data ?? []).find((r: any) => r.fornecedor?.id === fornId)
  const base = { descricao: nome, precoCusto: custo, precoCompra: custo, padrao: true, produto: { id: prodId }, fornecedor: { id: fornId } }
  if (meu?.id) {
    if (Math.abs(Number(meu.precoCusto) - custo) < 0.005) return 'ja igual'
    await withBling((b) => b.produtosFornecedores.update({ idProdutoFornecedor: meu.id, ...base } as any))
    return 'atualizado'
  }
  await withBling((b) => b.produtosFornecedores.create(base as any))
  return 'criado'
}

async function main() {
  const cat = JSON.parse(readFileSync(JSON_IN, 'utf8')) as { _estoque_inicial: number; produtos: Item[] }
  const descs = lerDescricoes()
  const imagens: Record<string, string[]> = imagensPath ? JSON.parse(readFileSync(imagensPath, 'utf8')) : {}
  let itens = cat.produtos
  if (only) itens = itens.filter((i) => i.sku === only)
  if (!itens.length) throw new Error(`Nenhum produto (filtro --only ${only ?? '-'})`)

  if (apply && offline) throw new Error('--apply e --offline são incompatíveis')
  console.log(apply ? '\n!!!!!!!! MODO ESCRITA (--apply): VAI GRAVAR NO BLING !!!!!!!!\n'
    : offline ? '\n[OFFLINE] sem rede, ids resolvidos em runtime viram placeholders\n'
    : '\n[DRY] leituras permitidas, NADA será escrito\n')

  let categoriaId = -1, origem = -1, cest: string | undefined = '<CEST-DA-REFERENCIA>', depId = DEPOSITO_ESPERADO
  if (!offline) {
    categoriaId = await resolverCategoria()
    const f = await resolverFiscalRef()
    origem = f.origem; cest = f.cest
    const dep = await depositoPadrao()
    depId = dep.id
    if (dep.id !== DEPOSITO_ESPERADO) console.warn(`⚠️ depósito padrão é ${dep.id} "${dep.descricao}", esperado ${DEPOSITO_ESPERADO} "Geral"`)
    console.log(`categoria ${categoriaId} | origem ${origem} cest ${cest ?? '-'} | depósito ${dep.id} "${dep.descricao}"`)
  }

  const fornId = apply ? await garantirFornecedor() : offline ? -1 : undefined
  const resultado: Record<string, number> = {}
  const resumo: string[][] = []

  for (const it of itens) {
    const d = descricaoDe(it, descs)
    const input: ProdutoInput = {
      nome: it.nome, codigo: it.sku, preco: it.preco, tipo: 'P', situacao: 'A', formato: 'S', unidade: 'UN',
      gtin: it.gtin, marca: 'Bambu Lab', categoriaId: offline ? -1 : categoriaId,
      pesoBruto: 1.2, pesoLiquido: 1.0, largura: 22, altura: 8, profundidade: 22,
      descricaoCurta: d.curta, descricaoComplementar: d.html,
      ncm: '3916.90.10', origem: offline ? -1 : origem, cest,
    }
    if (imagens[it.sku]?.length) input.imagens = imagens[it.sku]

    if (!apply) {
      const p = { ...input } as Record<string, unknown>
      if (offline) { p.categoriaId = '<resolvido em runtime>'; p.origem = '<da referência>' }
      console.log(`\n--- ${it.sku} ---\n${JSON.stringify(p, null, 2)}`)
      console.log(`custo ${it.custo} (${FORN_CODIGO}, padrao) | estoque B ${cat._estoque_inicial} no depósito ${depId} se novo`)
      let acao = 'offline'
      let id = '-'
      if (!offline) {
        const ex = await findProdutoByCodigo(it.sku)
        acao = ex?.id ? 'existe->update' : 'novo->create'
        id = ex?.id ? String(ex.id) : '-'
      }
      resumo.push([it.sku, id, acao, String(it.custo), acao === 'novo->create' || offline ? String(cat._estoque_inicial) : '-'])
      continue
    }

    try {
      const { id, created } = await upsertProduto(input)
      if (!id) throw new Error('upsert sem id')
      resultado[it.sku] = id
      console.log(`${it.sku}: ${created ? 'criado' : 'atualizado'} [${id}]`)
      const c = it.custo == null ? 'sem custo (pendente)' : await gravarCusto(id, it.nome, it.custo, fornId!)
      let est = '-'
      if (created) {
        await withBling((b) => b.estoques.create({
          produto: { id }, deposito: { id: depId }, operacao: 'B', quantidade: cat._estoque_inicial,
          observacoes: 'Saldo inicial filamentos Bambu Lab',
        } as any))
        est = String(cat._estoque_inicial)
      }
      resumo.push([it.sku, String(id), created ? 'criado' : 'atualizado', `${it.custo} (${c})`, est])
    } catch (e) {
      console.error(`   ❌ ${it.sku}: ${e instanceof Error ? e.message : e}`)
      resumo.push([it.sku, '-', 'ERRO', '-', '-'])
    }
  }

  console.log('\nsku | id | action | custo | estoque')
  for (const r of resumo) console.log(r.join(' | '))
  if (apply) {
    let atual = {}
    try { atual = JSON.parse(readFileSync(OUT, 'utf8')) } catch {}
    writeFileSync(OUT, JSON.stringify({ ...atual, ...resultado }, null, 2) + '\n'); console.log(`\nresultado -> ${OUT}`)
  }
}

main().catch((e) => { console.error('FALHA:', e instanceof Error ? e.message : e); process.exit(1) })
