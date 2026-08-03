/**
 * READ-ONLY: últimos pedidos de venda no Bling. Usado pra confirmar se o pedido
 * da Shopify foi importado e com quais dados (principalmente CPF do contato).
 *
 *   npx tsx src/scripts/check-pedidos.ts
 */
import { withBling } from '../api/client.js'

const res: any = await withBling((b) => b.pedidosVendas.get({ pagina: 1, limite: 20 } as any))
const pedidos: any[] = res?.data ?? []

console.log(`\n${pedidos.length} pedidos no Bling (página 1)\n`)
for (const p of pedidos) {
  console.log(
    `  #${p.numero} | id:${p.id} | ${p.data} | R$ ${p.total} | loja:${p.loja?.id ?? '—'} | situacao:${p.situacao?.id ?? p.situacao} | contato: ${p.contato?.nome ?? '—'} (${p.contato?.numeroDocumento ?? 'SEM DOC'})`,
  )
}

// detalhe do mais recente
if (pedidos[0]?.id) {
  const det: any = await withBling((b) => b.pedidosVendas.find({ idPedidoVenda: pedidos[0].id } as any))
  const d = det?.data ?? {}
  console.log(`\n### DETALHE DO MAIS RECENTE (#${d.numero})`)
  console.log(`  loja        : ${JSON.stringify(d.loja)}`)
  console.log(`  numeroLoja  : ${d.numeroLoja ?? '—'}`)
  console.log(`  contato     : ${d.contato?.nome} | doc: ${d.contato?.numeroDocumento ?? 'SEM DOC'} | tipo: ${d.contato?.tipoPessoa ?? '—'}`)
  console.log(`  situacao    : ${JSON.stringify(d.situacao)}`)
  console.log(`  total       : ${d.total} | itens: ${(d.itens ?? []).length}`)
  for (const i of d.itens ?? []) console.log(`     - ${i.codigo} | ${i.descricao?.slice(0, 50)} | qtd ${i.quantidade} | R$ ${i.valor}`)
}
console.log('')
