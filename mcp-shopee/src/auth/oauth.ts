import { config } from '../config.js'
import { readTokens, writeTokens, type Tokens } from './token-store.js'
import { signPublic, unixNow } from './sign.js'

/**
 * Monta a URL de autorização de loja para o Shopee Open Platform.
 * O lojista abre essa URL, autoriza o app, e o Shopee redireciona para
 * a redirect_uri com ?code=...&shop_id=... na barra de endereço.
 */
export function buildAuthorizeUrl(): string {
  const timestamp = unixNow()
  const apiPath = config.authorizeBasePath
  const sign = signPublic(apiPath, timestamp)

  const u = new URL(config.apiBase + apiPath)
  u.searchParams.set('partner_id', String(config.partnerId))
  u.searchParams.set('timestamp', String(timestamp))
  u.searchParams.set('sign', sign)
  u.searchParams.set('redirect', config.redirectUri)
  return u.toString()
}

interface TokenResponse {
  access_token: string
  refresh_token: string
  expire_in: number // segundos até expirar
  shop_id?: number
  merchant_id?: number
  error?: string
  message?: string
  request_id?: string
}

async function postToken(body: Record<string, unknown>): Promise<Tokens> {
  const timestamp = unixNow()
  const apiPath = config.tokenUrl.replace(config.apiBase, '')
  const sign = signPublic(apiPath, timestamp)

  const url = new URL(config.tokenUrl)
  url.searchParams.set('partner_id', String(config.partnerId))
  url.searchParams.set('timestamp', String(timestamp))
  url.searchParams.set('sign', sign)

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = (await res.json()) as TokenResponse
  if (!res.ok || json.error) {
    throw new Error(
      `Shopee OAuth ${res.status}: ${json.error ?? ''} ${json.message ?? JSON.stringify(json)}`,
    )
  }
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    // expire_in em segundos; guardamos como epoch ms com margem de 5 min
    expires_at: Date.now() + (json.expire_in ?? 14400) * 1000,
    shop_id: json.shop_id,
    merchant_id: json.merchant_id,
  }
}

/** Troca o authorization_code pelos primeiros tokens e persiste. */
export async function exchangeCodeForTokens(code: string, shopId?: number): Promise<Tokens> {
  const tokens = await postToken({
    code,
    shop_id: shopId ?? config.shopId,
    partner_id: config.partnerId,
  })
  writeTokens(tokens)
  return tokens
}

let refreshing: Promise<Tokens> | null = null

/** Renova o access_token usando o refresh_token. */
async function refresh(current: Tokens): Promise<Tokens> {
  const timestamp = unixNow()
  const apiPath = config.refreshUrl.replace(config.apiBase, '')
  const sign = signPublic(apiPath, timestamp)

  const url = new URL(config.refreshUrl)
  url.searchParams.set('partner_id', String(config.partnerId))
  url.searchParams.set('timestamp', String(timestamp))
  url.searchParams.set('sign', sign)

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      refresh_token: current.refresh_token,
      partner_id: config.partnerId,
      shop_id: current.shop_id ?? config.shopId,
    }),
  })
  const json = (await res.json()) as TokenResponse
  if (!res.ok || json.error) {
    throw new Error(
      `Shopee refresh ${res.status}: ${json.error ?? ''} ${json.message ?? JSON.stringify(json)}`,
    )
  }
  const tokens: Tokens = {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: Date.now() + (json.expire_in ?? 14400) * 1000,
    shop_id: json.shop_id ?? current.shop_id,
    merchant_id: json.merchant_id ?? current.merchant_id,
  }
  writeTokens(tokens)
  return tokens
}

/**
 * Retorna um access_token válido, renovando de forma transparente e serializada
 * (evita refresh concorrente).
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
