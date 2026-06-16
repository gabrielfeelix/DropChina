/**
 * Autorização da loja no Shopee Open Platform (rodar UMA vez, com o dono logado).
 *
 * Fluxo de COLAR O CODE (Shopee exige redirect_uri HTTPS — igual ao ML):
 *
 *   1. npm run authorize           → imprime a URL de autorização
 *   2. abrir a URL no navegador (logado como dono da loja), clicar em Autorizar
 *   3. a Shopee redireciona pra sua redirect_uri com ?code=...&shop_id=...
 *      (a página pode dar erro/404 — não importa, pegamos o code + shop_id da URL)
 *   4. copiar os valores e rodar:
 *        npm run authorize -- --code=SEU_CODE --shop-id=SEU_SHOP_ID
 *      (também aceita colar a URL inteira: --code="https://.../?code=...&shop_id=...")
 *
 * O code expira em poucos minutos — faça sem demora.
 */
import { randomBytes } from 'node:crypto'
import { buildAuthorizeUrl, exchangeCodeForTokens } from '../auth/oauth.js'
import { tokensPath } from '../auth/token-store.js'
import { config } from '../config.js'

function parseArg(name: string): string | null {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`))
  if (!arg) return null
  return arg.slice(`--${name}=`.length).trim()
}

function parseCodeAndShopId(): { code: string | null; shopId: number | null } {
  let codeRaw = parseArg('code')
  let shopIdRaw = parseArg('shop-id') ?? parseArg('shop_id')

  // Aceita colar a URL inteira no --code
  if (codeRaw?.startsWith('http')) {
    try {
      const u = new URL(codeRaw)
      if (!shopIdRaw) shopIdRaw = u.searchParams.get('shop_id')
      codeRaw = u.searchParams.get('code')
    } catch {
      // mantém o valor bruto
    }
  }

  return {
    code: codeRaw,
    shopId: shopIdRaw ? Number(shopIdRaw) : null,
  }
}

async function main() {
  const { code, shopId } = parseCodeAndShopId()

  if (!code) {
    // Gera um state aleatório apenas para referência visual — a Shopee não usa state OAuth padrão
    const state = randomBytes(8).toString('hex')

    console.log('\n🔗 1) Abra esta URL no navegador (logado como dono da loja Shopee) e autorize o app:\n')
    console.log('   ' + buildAuthorizeUrl() + '\n')
    console.log('2) A Shopee vai redirecionar pra sua redirect_uri com ?code=...&shop_id=... na URL.')
    console.log('   (a página pode dar erro — tudo bem, só precisamos do code e shop_id da URL)\n')
    console.log('3) Copie os valores e rode:\n')
    console.log('   npm run authorize -- --code=SEU_CODE --shop-id=SEU_SHOP_ID')
    console.log('   (ou cole a URL inteira: npm run authorize -- --code="https://.../?code=...&shop_id=...")\n')
    console.log(`referência state local: ${state}\n`)
    console.log(`SHOPEE_PARTNER_ID configurado: ${config.partnerId}`)
    console.log(`SHOPEE_SHOP_ID no .env: ${config.shopId} (pode ser sobrescrito pelo --shop-id da URL)\n`)
    return
  }

  try {
    const resolvedShopId = shopId ?? config.shopId
    const tokens = await exchangeCodeForTokens(code, resolvedShopId)
    const expira = new Date(tokens.expires_at).toLocaleString('pt-BR')
    console.log('\n✅ Autorizado! Tokens salvos em', tokensPath())
    console.log(`   shop_id: ${tokens.shop_id ?? resolvedShopId}`)
    console.log(`   access_token expira em: ${expira}`)
    console.log(`   (refresh_token dura ~30 dias sem uso — renove periodicamente)\n`)
  } catch (err) {
    console.error('\n❌', err instanceof Error ? err.message : err)
    console.error(
      '   (o code expira em minutos e é de uso único — gere outro rodando `npm run authorize` sem --code)\n',
    )
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
})
