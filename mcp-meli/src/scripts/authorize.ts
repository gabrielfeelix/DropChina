/**
 * Autorização OAuth do Mercado Livre (rodar UMA vez, com o Augusto/dono logado).
 *
 * O ML EXIGE redirect_uri HTTPS — não dá pra usar callback em localhost. Então
 * usamos o fluxo de COLAR O CODE:
 *
 *   1. npm run authorize           → imprime a URL de autorização
 *   2. abrir a URL no navegador (logado como dono), clicar em Autorizar
 *   3. o ML redireciona pra sua redirect_uri com ?code=...&state=...
 *      (a página pode dar erro/404 — não importa, o code está na barra de URL)
 *   4. copiar o valor de `code` e rodar:
 *        npm run authorize -- --code=SEU_CODE
 *      (também aceita colar a URL inteira: --code="https://.../?code=...&state=...")
 *
 * O code expira em ~minutos — faça sem demora.
 */
import { randomBytes } from 'node:crypto'
import { buildAuthorizeUrl, exchangeCodeForTokens } from '../auth/oauth.js'
import { tokensPath } from '../auth/token-store.js'

function parseCodeArg(): string | null {
  const arg = process.argv.find((a) => a.startsWith('--code='))
  if (!arg) return null
  const raw = arg.slice('--code='.length).trim()
  if (raw.startsWith('http')) {
    try {
      return new URL(raw).searchParams.get('code')
    } catch {
      return raw
    }
  }
  return raw
}

const code = parseCodeArg()

if (!code) {
  const state = randomBytes(8).toString('hex')
  console.log('\n🔗 1) Abra esta URL no navegador (logado como o dono da conta ML) e clique em Autorizar:\n')
  console.log('   ' + buildAuthorizeUrl(state) + '\n')
  console.log('2) O ML vai redirecionar pra sua redirect_uri com ?code=... na barra de endereço.')
  console.log('   (a página pode dar erro — tudo bem, só precisamos do code da URL)\n')
  console.log('3) Copie o code e rode:\n')
  console.log('   npm run authorize -- --code=SEU_CODE')
  console.log('   (ou cole a URL inteira: npm run authorize -- --code="https://.../?code=...")\n')
  console.log(`state esperado: ${state} (confira que bate na URL de retorno)\n`)
  process.exit(0)
}

try {
  const tokens = await exchangeCodeForTokens(code)
  const expira = new Date(tokens.expires_at).toLocaleString('pt-BR')
  console.log('\n✅ Autorizado! Tokens salvos em', tokensPath())
  console.log(`   user_id: ${tokens.user_id}`)
  console.log(`   access_token expira em: ${expira}`)
  console.log(`   escopos: ${tokens.scope ?? '(não informado)'}\n`)
} catch (err) {
  console.error('\n❌', err instanceof Error ? err.message : err)
  console.error('   (o code expira rápido e é de uso único — gere outro rodando `npm run authorize` sem --code)\n')
  process.exit(1)
}
