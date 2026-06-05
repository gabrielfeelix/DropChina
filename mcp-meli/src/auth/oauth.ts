import { config } from '../config.js'
import { readTokens, writeTokens, type Tokens } from './token-store.js'

/** Monta a URL de autorização (browser). `state` é validado por nós. */
export function buildAuthorizeUrl(state: string): string {
  const u = new URL(config.authorizeUrl)
  u.searchParams.set('response_type', 'code')
  u.searchParams.set('client_id', config.clientId)
  u.searchParams.set('redirect_uri', config.redirectUri)
  u.searchParams.set('state', state)
  return u.toString()
}

interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user_id?: number
  scope?: string
}

async function postToken(params: Record<string, string>): Promise<Tokens> {
  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  })
  const json = (await res.json()) as TokenResponse & { message?: string; error?: string }
  if (!res.ok) {
    throw new Error(`OAuth ${res.status}: ${json.error ?? ''} ${json.message ?? JSON.stringify(json)}`)
  }
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: Date.now() + (json.expires_in ?? 21600) * 1000,
    user_id: json.user_id,
    scope: json.scope,
  }
}

/** Troca o authorization_code pelos primeiros tokens e persiste. */
export async function exchangeCodeForTokens(code: string): Promise<Tokens> {
  const tokens = await postToken({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
  })
  writeTokens(tokens)
  return tokens
}

let refreshing: Promise<Tokens> | null = null

/** Renova usando o refresh_token. ML rotaciona o refresh — persistimos o novo. */
async function refresh(current: Tokens): Promise<Tokens> {
  const tokens = await postToken({
    grant_type: 'refresh_token',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: current.refresh_token,
  })
  writeTokens(tokens)
  return tokens
}

/**
 * Retorna um access_token válido, renovando de forma transparente e serializada
 * (sem refresh concorrente — o refresh do ML é single-use).
 */
export async function getValidAccessToken(): Promise<string> {
  const tokens = readTokens()
  if (!tokens) {
    throw new Error('Sem tokens. Rode `npm run authorize` primeiro.')
  }
  // margem de 5 min antes de expirar
  if (Date.now() < tokens.expires_at - 5 * 60 * 1000) {
    return tokens.access_token
  }
  if (!refreshing) {
    refreshing = refresh(tokens).finally(() => {
      refreshing = null
    })
  }
  const renewed = await refreshing
  return renewed.access_token
}
