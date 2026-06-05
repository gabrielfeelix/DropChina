import BlingSDK from 'bling-erp-api'
import { getValidAccessToken } from '../auth/oauth.js'
import { blingRateLimiter } from './rate-limiter.js'

/**
 * O SDK `bling-erp-api` v5 é CommonJS (`exports.default = class Bling`). Sob ESM
 * interop o construtor pode chegar como `BlingSDK` ou como `BlingSDK.default`,
 * dependendo do loader. Resolvemos os dois casos aqui.
 */
const BlingCtor = ((BlingSDK as unknown as { default?: typeof BlingSDK }).default ??
  BlingSDK) as typeof BlingSDK

/** Tipo da instância do cliente Bling. */
export type BlingClient = InstanceType<typeof BlingSDK>

/**
 * Camada fina sobre o SDK `bling-erp-api`.
 *
 * O SDK recebe o access_token na instância e não faz o refresh sozinho — então
 * pegamos sempre um token válido (renovando de forma transparente) antes de cada
 * operação e instanciamos o cliente na hora. Toda chamada passa pelo rate limiter
 * (≤3 req/s) para nunca estourar o limite do Bling.
 */
export async function getBling(): Promise<BlingClient> {
  const accessToken = await getValidAccessToken()
  return new BlingCtor(accessToken)
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Executa uma operação contra a API respeitando o rate limit, com retry em 429
 * (limite de requisições) usando backoff exponencial.
 * `fn` recebe o cliente Bling já autenticado.
 */
export async function withBling<T>(fn: (bling: BlingClient) => Promise<T>): Promise<T> {
  const maxAttempts = 5
  for (let attempt = 1; ; attempt++) {
    await blingRateLimiter.acquire()
    const bling = await getBling()
    try {
      return await fn(bling)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const is429 = /limite de requisi|too many requests|429/i.test(msg)
      if (is429 && attempt < maxAttempts) {
        await sleep(Math.min(2 ** attempt * 400, 6000))
        continue
      }
      throw err
    }
  }
}
