import { config } from '../config.js'
import { getValidAccessToken } from '../auth/oauth.js'
import { signShop, unixNow } from '../auth/sign.js'
import { readTokens } from '../auth/token-store.js'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * GET autenticado contra a Shopee Open Platform API v2. Somente leitura.
 * - injeta partner_id, timestamp, sign, access_token, shop_id
 * - 429 → backoff exponencial com jitter (rate limit ~100 req/min)
 *
 * @param apiPath  Caminho do endpoint, ex.: "/api/v2/product/get_item_list"
 * @param query    Query params adicionais (sem os de autenticação — esses são injetados)
 */
export async function shopeeGet<T = unknown>(
  apiPath: string,
  query: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  const maxAttempts = 5

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const accessToken = await getValidAccessToken()
    const tokens = readTokens()
    const shopId = tokens?.shop_id ?? config.shopId
    const timestamp = unixNow()
    const sign = signShop(apiPath, timestamp, accessToken, shopId)

    const url = new URL(config.apiBase + apiPath)
    url.searchParams.set('partner_id', String(config.partnerId))
    url.searchParams.set('timestamp', String(timestamp))
    url.searchParams.set('sign', sign)
    url.searchParams.set('access_token', accessToken)
    url.searchParams.set('shop_id', String(shopId))

    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v))
    }

    const res = await fetch(url, {
      headers: { accept: 'application/json' },
    })

    if (res.ok) {
      const json = (await res.json()) as { error?: string; message?: string; response?: unknown } & T
      // A Shopee retorna HTTP 200 mesmo em erros lógicos — checar o campo "error"
      if (json.error && json.error !== '' && json.error !== 'error_not_found') {
        throw new Error(`Shopee API ${apiPath} → ${json.error}: ${json.message ?? ''}`)
      }
      return json
    }

    if (res.status === 429 && attempt < maxAttempts) {
      const backoff = Math.min(2 ** attempt * 500, 8000) + Math.floor(Math.random() * 400)
      await sleep(backoff)
      continue
    }

    const body = await res.text()
    throw new Error(`Shopee GET ${apiPath} → ${res.status}: ${body.slice(0, 400)}`)
  }

  // TypeScript — nunca alcançado (loop sempre lança ou retorna antes)
  throw new Error(`Shopee GET ${apiPath}: máximo de tentativas atingido`)
}
