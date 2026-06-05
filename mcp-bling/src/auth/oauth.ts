import { config } from '../config.js'
import {
  fromTokenResponse,
  loadTokens,
  saveTokens,
  type StoredTokens,
} from './token-store.js'

interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope?: string
}

/** Header Basic com client_id:client_secret em base64 (exigido pelo /oauth/token). */
function basicAuthHeader(): string {
  const creds = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
  return `Basic ${creds}`
}

/** Monta a URL de autorização (passo do navegador). `state` deve ser aleatório (anti-CSRF). */
export function buildAuthorizeUrl(state: string): string {
  const url = new URL(config.authorizeUrl)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('state', state)
  return url.toString()
}

async function postToken(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams(body).toString(),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    if (res.status === 429) {
      throw new Error(
        `Bling /oauth/token retornou 429 (rate limit). CUIDADO: 20 chamadas/min bloqueiam o IP por 1h. ${detail}`,
      )
    }
    throw new Error(`Falha no /oauth/token (HTTP ${res.status}): ${detail}`)
  }
  return (await res.json()) as TokenResponse
}

/** Troca o `code` (válido por ~1 min) recebido no callback por tokens, e persiste. */
export async function exchangeCodeForTokens(code: string): Promise<StoredTokens> {
  const res = await postToken({ grant_type: 'authorization_code', code })
  const tokens = fromTokenResponse(res)
  await saveTokens(tokens)
  return tokens
}

async function refresh(refreshToken: string): Promise<StoredTokens> {
  const res = await postToken({ grant_type: 'refresh_token', refresh_token: refreshToken })
  const tokens = fromTokenResponse(res)
  await saveTokens(tokens)
  return tokens
}

// Renova quando faltar menos que isto para expirar (folga de 5 min).
const REFRESH_SKEW_MS = 5 * 60 * 1000

// Serializa o refresh: evita disparar várias chamadas concorrentes a /oauth/token.
let inFlightRefresh: Promise<StoredTokens> | null = null

/**
 * Retorna um access_token válido, renovando de forma transparente se necessário.
 * Lança se ainda não houve autorização (rode `npm run authorize`).
 */
export async function getValidAccessToken(): Promise<string> {
  const tokens = await loadTokens()
  if (!tokens) {
    throw new Error(
      'Sem tokens. Rode `npm run authorize` e faça o login do Augusto uma vez (ver README).',
    )
  }

  if (Date.now() < tokens.expires_at - REFRESH_SKEW_MS) {
    return tokens.access_token
  }

  if (!inFlightRefresh) {
    inFlightRefresh = refresh(tokens.refresh_token).finally(() => {
      inFlightRefresh = null
    })
  }
  const refreshed = await inFlightRefresh
  return refreshed.access_token
}
