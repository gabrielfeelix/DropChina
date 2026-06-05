/**
 * Probe READ-ONLY da conta Bling — mapeia o estado atual pra basear o plano de
 * configuração. Não escreve nada. Descartável.
 *
 *   npm run probe
 */
import { withBling } from '../api/client.js'

const out: Record<string, unknown> = {}

async function safe(label: string, fn: () => Promise<unknown>) {
  try {
    out[label] = await withBling(fn as any)
  } catch (err) {
    out[label] = { ERRO: err instanceof Error ? err.message : String(err) }
  }
}

// Empresa / dados fiscais
await safe('empresa', (b) => b.empresas.me({} as any))
// Canais de venda (integrações: MeLi, Shopify, etc.)
await safe('canaisDeVenda', (b) => b.canaisDeVenda.get({} as any))
await safe('canaisTipos', (b) => b.canaisDeVenda.getTypes())
// Depósitos de estoque
await safe('depositos', (b) => b.depositos.get({} as any))
// Naturezas de operação (CFOP / config NF-e)
await safe('naturezasOperacao', (b) => b.naturezasDeOperacoes.get({} as any))
// Formas de pagamento
await safe('formasPagamento', (b) => b.formasDePagamento.get({} as any))
// Categorias (confirmar as 12)
await safe('categorias', (b) => b.categoriasProdutos.get({} as any))
// Produtos (1ª página)
await safe('produtos', (b) => b.produtos.get({ pagina: 1, limite: 100 } as any))
// Contatos (1ª página)
await safe('contatos', (b) => b.contatos.get({ pagina: 1, limite: 10 } as any))
// NF-e recentes
await safe('nfes', (b) => b.nfes.get({ pagina: 1, limite: 10 } as any))

// Resumo enxuto pra não vazar dado sensível em massa
function arr(x: any): any[] {
  return Array.isArray(x?.data) ? x.data : Array.isArray(x) ? x : []
}

console.log('\n================ PROBE CONTA BLING ================\n')

const emp: any = (out.empresa as any)?.data ?? out.empresa
console.log('### EMPRESA / FISCAL')
if (emp?.ERRO) console.log('  ERRO:', emp.ERRO)
else
  console.log(
    JSON.stringify(
      {
        nome: emp?.nome ?? emp?.fantasia,
        regimeTributario: emp?.regimeTributario ?? emp?.tipoRegime,
        crt: emp?.crt,
        ie: emp?.ie ? 'presente' : 'ausente',
        certificadoDigital: emp?.certificado ?? emp?.certificadoDigital ?? '(não exposto na API)',
        keys: Object.keys(emp ?? {}),
      },
      null,
      2,
    ),
  )

console.log('\n### CANAIS DE VENDA (integrações)')
const canais = arr(out.canaisDeVenda)
if ((out.canaisDeVenda as any)?.ERRO) console.log('  ERRO:', (out.canaisDeVenda as any).ERRO)
else if (!canais.length) console.log('  (nenhum canal conectado)')
else canais.forEach((c: any) => console.log(`  - ${c.descricao ?? c.nome} [tipo: ${c.tipo}] situacao: ${c.situacao}`))
console.log('  tipos disponíveis:', JSON.stringify((out.canaisTipos as any)?.data ?? out.canaisTipos))

console.log('\n### DEPÓSITOS')
const deps = arr(out.depositos)
if ((out.depositos as any)?.ERRO) console.log('  ERRO:', (out.depositos as any).ERRO)
else deps.forEach((d: any) => console.log(`  - ${d.descricao} (id ${d.id}) padrao:${d.padrao}`))

console.log('\n### NATUREZAS DE OPERAÇÃO (NF-e)')
const nat = arr(out.naturezasOperacao)
if ((out.naturezasOperacao as any)?.ERRO) console.log('  ERRO:', (out.naturezasOperacao as any).ERRO)
else if (!nat.length) console.log('  (nenhuma — NF-e provavelmente não configurada)')
else nat.forEach((n: any) => console.log(`  - ${n.descricao} (id ${n.id})`))

console.log('\n### FORMAS DE PAGAMENTO')
const fp = arr(out.formasPagamento)
if ((out.formasPagamento as any)?.ERRO) console.log('  ERRO:', (out.formasPagamento as any).ERRO)
else fp.forEach((f: any) => console.log(`  - ${f.descricao} (id ${f.id})`))

console.log('\n### CATEGORIAS')
const cats = arr(out.categorias)
console.log(`  total: ${cats.length}`)

console.log('\n### PRODUTOS')
const prods = arr(out.produtos)
if ((out.produtos as any)?.ERRO) console.log('  ERRO:', (out.produtos as any).ERRO)
else {
  console.log(`  total na 1ª página: ${prods.length}`)
  prods.slice(0, 5).forEach((p: any) =>
    console.log(`  - ${p.nome} | codigo:${p.codigo} | gtin:${p.gtin ?? '—'} | preco:${p.preco} | ncm:${p.tributacao?.ncm ?? '—'}`),
  )
}

console.log('\n### CONTATOS')
console.log(`  total na amostra: ${arr(out.contatos).length}`)

console.log('\n### NF-e EMITIDAS')
const nfes = arr(out.nfes)
if ((out.nfes as any)?.ERRO) console.log('  ERRO:', (out.nfes as any).ERRO)
else console.log(`  total na amostra: ${nfes.length}`)

console.log('\n===================================================\n')
