/**
 * Fluxo de autorização OAuth (rodar UMA vez, com o Augusto logado).
 *
 *   npm run authorize
 *
 * 1. Sobe um servidor local em redirect_uri (ex.: http://localhost:3000/callback).
 * 2. Imprime a URL de autorização — o Augusto abre no navegador e clica em "Autorizar".
 * 3. O Bling redireciona com ?code=... ; capturamos e trocamos por tokens.
 *    ⚠️ O `code` expira em ~1 minuto: fazer o login sem demora.
 */
import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'
import { config, callbackPort } from '../config.js'
import { buildAuthorizeUrl, exchangeCodeForTokens } from '../auth/oauth.js'

const state = randomBytes(16).toString('hex')
const port = callbackPort()
const callbackPath = new URL(config.redirectUri).pathname

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${port}`)
  if (url.pathname !== callbackPath) {
    res.writeHead(404).end('Not found')
    return
  }

  const code = url.searchParams.get('code')
  const returnedState = url.searchParams.get('state')

  if (returnedState !== state) {
    res.writeHead(400).end('State inválido (possível CSRF). Tente de novo.')
    console.error('❌ state divergente — abortando.')
    server.close()
    process.exitCode = 1
    return
  }
  if (!code) {
    res.writeHead(400).end('Sem code na resposta.')
    console.error('❌ callback sem code.')
    server.close()
    process.exitCode = 1
    return
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(
      '<h1>✅ Autorizado!</h1><p>Pode fechar esta aba e voltar ao terminal.</p>',
    )
    const expira = new Date(tokens.expires_at).toLocaleString('pt-BR')
    console.log('✅ Tokens salvos em tokens.json')
    console.log(`   access_token expira em: ${expira}`)
    console.log(`   escopos: ${tokens.scope ?? '(não informado)'}`)
  } catch (err) {
    res.writeHead(500).end('Erro ao trocar code por token. Veja o terminal.')
    console.error('❌', err instanceof Error ? err.message : err)
    process.exitCode = 1
  } finally {
    server.close()
  }
})

server.listen(port, () => {
  const authUrl = buildAuthorizeUrl(state)
  console.log('\n🔗 Abra esta URL no navegador (logado como o Augusto) e clique em Autorizar:\n')
  console.log('   ' + authUrl + '\n')
  console.log(`⏳ Aguardando o callback em ${config.redirectUri} ...`)
  console.log('   (o code do Bling expira em ~1 minuto — não demore)\n')
})
