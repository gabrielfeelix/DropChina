/**
 * authorize.ts — Validação de credenciais SP-API (NÃO é um fluxo OAuth interativo).
 *
 * ─── POR QUE É DIFERENTE DO mcp-meli ────────────────────────────────────────
 *
 * A Amazon SP-API NÃO usa o fluxo Authorization Code padrão que o ML usa.
 * O refresh_token LWA é obtido de uma forma diferente, dependendo do tipo de app:
 *
 * 1. Self-Authorization (conta própria — o caso da DropChina):
 *    a. Acesse Seller Central BR > Apps & Services > Develop Apps
 *    b. Crie um app ("Authorize Yourself")
 *    c. Clique em "Authorize" — o Seller Central gera o refresh_token automaticamente
 *       e exibe em tela. COPIE ESSE TOKEN e coloque em SP_API_REFRESH_TOKEN no .env.
 *    d. Preencha também LWA_CLIENT_ID e LWA_CLIENT_SECRET do app.
 *    Ref: https://developer-docs.amazon.com/sp-api/docs/self-authorization
 *
 * 2. Solution Provider (multi-seller):
 *    Requer OAuth flow via URL de autorização + redirect — mais complexo,
 *    fora do escopo desta DropChina-apenas ferramenta.
 *
 * ─── O QUE ESTE SCRIPT FAZ ───────────────────────────────────────────────────
 *
 * Valida as credenciais fazendo uma chamada READ simples à SP-API (getCatalogItem
 * de um ASIN público) e reporta se a autenticação funcionou.
 *
 * Uso:
 *   npm run authorize              # valida com ASIN padrão
 *   npm run authorize -- --asin=B09V3KXJPB  # valida com ASIN específico
 *
 * ─── PRÉ-REQUISITOS ──────────────────────────────────────────────────────────
 *
 * 1. Conta de vendedor Amazon BR ativa.
 * 2. App registrado no Seller Central (Develop Apps).
 *    ATENÇÃO: apps que acessam dados sensíveis (Orders, Reports) passam por
 *    processo de aprovação que pode levar 1-2 SEMANAS.
 *    Para Catalog Items e Listings (leitura de catálogo) a aprovação é mais rápida.
 * 3. SP_API_REFRESH_TOKEN obtido via self-authorization (passo 1c acima).
 * 4. LWA_CLIENT_ID e LWA_CLIENT_SECRET preenchidos no .env.
 */

import { getSellingPartner } from '../api/client.js'
import { writeTokens, tokensPath } from '../auth/token-store.js'
import { config } from '../config.js'

const DEFAULT_TEST_ASIN = 'B09V3KXJPB' // ASIN público genérico para teste

async function main() {
  const asinArg = process.argv.find((a) => a.startsWith('--asin='))
  const testAsin = asinArg ? asinArg.slice('--asin='.length) : DEFAULT_TEST_ASIN

  console.log('\n🔐 Validando credenciais SP-API...')
  console.log(`   Região:        ${config.spApiRegion}`)
  console.log(`   Marketplace:   ${config.marketplaceId}`)
  console.log(`   LWA Client ID: ${config.lwaClientId.slice(0, 12)}...`)
  console.log(`   Refresh Token: ${config.spApiRefreshToken.slice(0, 15)}...`)
  console.log(`   ASIN de teste: ${testAsin}\n`)

  const sp = getSellingPartner()

  try {
    // Tenta trocar o refresh_token por access_token
    await sp.refreshAccessToken()
    console.log('✅ Access token obtido com sucesso (LWA OK).')
  } catch (err) {
    console.error('❌ Falha ao obter access token:', err instanceof Error ? err.message : err)
    console.error('\n   Verifique:')
    console.error('   1. LWA_CLIENT_ID e LWA_CLIENT_SECRET corretos')
    console.error('   2. SP_API_REFRESH_TOKEN obtido via self-authorization')
    console.error('   3. App aprovado no Seller Central\n')
    process.exit(1)
  }

  try {
    // Testa uma chamada real de leitura
    await sp.callAPI({
      operation: 'getCatalogItem',
      endpoint: 'catalog',
      path: { asin: testAsin },
      query: {
        marketplaceIds: config.marketplaceId,
        includedData: 'summaries',
      },
    })
    console.log(`✅ Chamada SP-API bem-sucedida (getCatalogItem ASIN ${testAsin}).`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // ASIN não encontrado no marketplace ainda é "autenticado" — só o produto não existe
    if (msg.includes('404') || msg.includes('not found') || msg.includes('NO_RESULT')) {
      console.log('✅ Autenticação OK (ASIN não encontrado no marketplace, mas credenciais válidas).')
    } else {
      console.error('❌ Falha na chamada SP-API:', msg)
      console.error('\n   Possíveis causas:')
      console.error('   - App sem permissão para Catalog Items API (aguardar aprovação)')
      console.error('   - Região incorreta (verifique SP_API_REGION)')
      console.error('   - Marketplace ID incorreto\n')
      process.exit(1)
    }
  }

  // Persiste o refresh_token no tokens.json para conveniência
  writeTokens({
    refresh_token: config.spApiRefreshToken,
    saved_at: Date.now(),
    marketplace_id: config.marketplaceId,
  })

  console.log(`\n✅ Credenciais validadas! Refresh token salvo em ${tokensPath()}`)
  console.log('   Próximo passo: npm run pull\n')
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
