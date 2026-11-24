/**
 * Cadastra a Scooter Elétrica DC AZM X15 no Bling espelhando a X13 (pai 16738890757):
 * pai formato V + 6 variações "Cor:X", categoria Mobilidade Elétrica, 65 kg, 135x65x33 cm.
 * Preço = cartão (6.000), como a X13 (5.500). Estoque inicial 10 por cor, só se criado agora.
 * NCM fica vazio como na X13 — pendência fiscal (8711.60?, confirmar com contador).
 *
 *   npx tsx src/scripts/criar-x15-bling.ts            # DRY: imprime o payload
 *   npx tsx src/scripts/criar-x15-bling.ts --apply    # ESCREVE no Bling
 */
import { withBling } from '../api/client.js'
import { findProdutoByCodigo, getProduto } from '../api/produtos.js'

const apply = process.argv.includes('--apply')
const PAI_X13 = 16738890757
const CODIGO = 'DC-AZM-X15'
const NOME = 'Scooter Elétrica DC AZM X15 1000W Aro 14 Bateria de Lítio Removível'
const PRECO = 6000
const ESTOQUE = 10
const DEPOSITO = 14888019804
const CORES: [string, string][] = [
  ['Branco', 'BRANCO'], ['Prateado', 'PRATEADO'], ['Preto', 'PRETO'],
  ['Cinza-escuro', 'CINZA-ESCURO'],
]

const DESCRICAO = `<h3>POTÊNCIA E DESEMPENHO</h3>
<p>A AZM X15 combina design de scooter urbana, motor brushless de 1000W e bateria de lítio 48V 20Ah removível para deslocamentos ágeis, econômicos e silenciosos.</p>
<h3>DESTAQUES</h3>
<ul><li>Motor brushless (sem escovas) de 1000W</li><li>Bateria de Lítio 48V 20Ah removível</li><li>Autonomia de até 55 km por carga</li><li>Velocidade máxima de 32 km/h</li><li>Suporta até 150 kg</li><li>Pneus aro 14 sem câmara (tubeless)</li><li>Acelerador independente</li><li>Painel digital com desbloqueio NFC</li><li>Recarga completa em 6 a 8 horas</li><li>Farol em LED</li><li>Banco com encosto para garupa</li></ul>
<h3>MONTAGEM</h3>
<p>O produto requer montagem. Junto com a compra enviamos o QR Code com o passo a passo de montagem.</p>
<h3>CUIDADOS E UTILIZAÇÃO</h3>
<p>Siga o manual do fabricante quanto à montagem, recarga, capacidade de carga e manutenção.</p>
<p>A autonomia varia conforme peso transportado, percurso, velocidade, temperatura, calibragem dos pneus e conservação da bateria.</p>
<p>Antes de circular em vias públicas, verifique a classificação do veículo e as exigências legais aplicáveis ao local de uso.</p>
<h3>GARANTIA</h3>
<p>Garantia de fábrica de 3 meses.</p>`

const ref: any = await getProduto(PAI_X13)
const comum = {
  tipo: 'P', situacao: 'A', unidade: ref.unidade ?? 'UN', marca: 'AZM',
  pesoLiquido: 65, pesoBruto: 65, condicao: 0, freteGratis: false,
  dimensoes: { largura: 135, altura: 65, profundidade: 33, unidadeMedida: 2 },
  categoria: { id: ref.categoria?.id },
  tributacao: { origem: ref.tributacao?.origem ?? 0 },
}
const body = {
  ...comum,
  nome: NOME, codigo: CODIGO, preco: PRECO, formato: 'V', descricaoCurta: DESCRICAO,
  variacoes: CORES.map(([cor, cod], i) => ({
    ...comum,
    nome: `${NOME} Cor:${cor}`, codigo: `${CODIGO}-${cod}`, preco: PRECO, formato: 'S',
    variacao: { nome: `Cor:${cor}`, ordem: i + 1, produtoPai: { cloneInfo: true } },
  })),
}

const ja = await findProdutoByCodigo(CODIGO)
if (ja) { console.log(`${CODIGO} já existe no Bling: id ${ja.id}`); process.exit(0) }
if (!apply) {
  console.log('[DRY] nada escrito. Use --apply.\n', JSON.stringify({ ...body, descricaoCurta: DESCRICAO.slice(0, 60) + '…' }, null, 1))
  process.exit(0)
}

const r: any = await withBling((b: any) => b.produtos.create(body as any))
const paiId = r.data?.id
if (!paiId) throw new Error(`create sem id: ${JSON.stringify(r)}`)
const pai: any = await getProduto(paiId)
console.log(`pai ${CODIGO} criado: ${paiId}`)
for (const v of pai.variacoes ?? []) {
  await withBling((b: any) => b.estoques.create({
    produto: { id: v.id }, deposito: { id: DEPOSITO }, operacao: 'B', quantidade: ESTOQUE,
    observacoes: 'Saldo inicial Scooter AZM X15',
  } as any))
  console.log(`  ${v.codigo} id ${v.id} | estoque ${ESTOQUE}`)
}
