import Bling from 'bling-erp-api'
import { getValidAccessToken } from '../auth/oauth.js'
import { blingRateLimiter } from './rate-limiter.js'

/**
 * Camada fina sobre o SDK `bling-erp-api`.
 *
 * O SDK recebe o access_token na instância e não faz o refresh sozinho — então
 * pegamos sempre um token válido (renovando de forma transparente) antes de cada
 * operação e instanciamos o cliente na hora. Toda chamada passa pelo rate limiter
 * (≤3 req/s) para nunca estourar o limite do Bling.
 */
export async function getBling(): Promise<Bling> {
  const accessToken = await getValidAccessToken()
  return new Bling(accessToken)
}

/**
 * Executa uma operação contra a API respeitando o rate limit.
 * `fn` recebe o cliente Bling já autenticado.
 */
export async function withBling<T>(fn: (bling: Bling) => Promise<T>): Promise<T> {
  await blingRateLimiter.acquire()
  const bling = await getBling()
  return fn(bling)
}
