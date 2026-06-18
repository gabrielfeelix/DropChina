/**
 * Grava descrição curta (descricaoCurta) nos produtos via API do Bling.
 * Mapa SKU→texto embutido. NÃO toca em outros campos.
 *
 * Segurança: como updateProduto é PUT, antes de gravar em massa o script faz um
 * TESTE no 1º SKU — lê tributacao.origem antes e depois pra confirmar que o PUT
 * não zera campos não enviados. Se zerar, ABORTA e avisa.
 *
 *   npm run set:short-desc -- --dry    # mostra o que faria
 *   npm run set:short-desc -- --test   # aplica só no 1º e confere origem
 *   npm run set:short-desc             # aplica nos 5 (após teste ok)
 */
import { findProdutoByCodigo, getProduto, updateProduto } from '../api/produtos.js'

const dry = process.argv.includes('--dry')
const testOnly = process.argv.includes('--test')

const SHORT: Record<string, string> = {
  'A1 mini':
    'Impressora 3D Bambu Lab A1 Combo com AMS (impressão multicor automática). Tecnologia FDM, mesa aquecida, área 25,6×25,6 cm, filamento 1.75 mm PLA/ABS. Bivolt 127/220V.',
  'Sata 240GB':
    'SSD Patriot Burst 240GB, 2.5" SATA III 6GB/s, cache 32MB. Deixa PC e notebook muito mais rápidos na inicialização e nos programas. Instalação interna.',
  'Impressora Snapmaker':
    'Impressora 3D Snapmaker U1 com 4 extrusores para impressão multicor real. FDM, mesa aquecida até 100°C, zona de impressão 27 cm. Bivolt.',
  'Sata 480GB':
    'SSD Patriot Burst Elite 480GB, 2.5" SATA III. Upgrade de desempenho para desktop e notebook com mais espaço. Instalação interna.',
  'Impressora Vinik':
    'Impressora térmica de etiquetas Vinik POS04, portátil com Bluetooth e USB. Resolução 203 dpi, impressão térmica direta (sem tinta/toner). Bivolt 127/220V.',
}

function origemDe(p: unknown): string | undefined {
  const trib = (p as { tributacao?: { origem?: unknown } } | null)?.tributacao
  return trib?.origem != null ? String(trib.origem) : undefined
}

async function main() {
  const skus = Object.keys(SHORT)
  console.log(`📝 ${skus.length} SKUs com short description.`)
  if (dry) {
    for (const sku of skus) console.log(`   ${sku} → ${SHORT[sku].slice(0, 60)}...`)
    console.log('\n🧪 DRY — nada gravado.')
    return
  }

  let ok = 0
  let semProduto = 0
  for (let idx = 0; idx < skus.length; idx++) {
    const sku = skus[idx]
    const p = await findProdutoByCodigo(sku)
    if (!p?.id) {
      console.log(`   ⚠️ ${sku}: produto não achado no Bling — pulado.`)
      semProduto++
      continue
    }

    // TESTE de segurança no 1º: confere origem antes/depois.
    if (idx === 0) {
      const antes = origemDe(await getProduto(p.id))
      await updateProduto(p.id, { descricaoCurta: SHORT[sku] })
      const depois = origemDe(await getProduto(p.id))
      console.log(`   🔬 ${sku}: origem antes=${antes ?? '∅'} depois=${depois ?? '∅'}`)
      if (antes && antes !== depois) {
        console.error(
          `\n❌ ABORTADO: PUT zerou tributacao.origem (${antes}→${depois}). ` +
            `updateProduto precisa reenviar payload completo. Nada mais foi gravado.`,
        )
        process.exit(1)
      }
      ok++
      console.log(`   ✅ ${sku}: short desc gravada, origem preservada.`)
      if (testOnly) {
        console.log('\n🔒 --test: parou no 1º (ok). Rode sem --test pra aplicar nos demais.')
        return
      }
      continue
    }

    await updateProduto(p.id, { descricaoCurta: SHORT[sku] })
    ok++
    console.log(`   ✅ ${sku}: short desc gravada.`)
  }
  console.log(`\n✅ Feito: ${ok} gravados, ${semProduto} sem produto.`)
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
