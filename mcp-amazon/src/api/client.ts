/**
 * client.ts — wrapper fino sobre o SDK `amazon-sp-api`.
 *
 * Instancia o SellingPartner com as creds do config e expõe `spCall` —
 * helper READ-ONLY com retry/backoff em throttling (429/QuotaExceeded).
 *
 * A SP-API usa LWA OAuth2 + AWS SigV4. O SDK cuida de ambos: troca o
 * refresh_token por access_token automaticamente e assina as requests com
 * SigV4 quando AWS credentials estão presentes. Para endpoints que NÃO
 * exigem SigV4 (ex.: Catalog Items v2022), o SDK funciona só com LWA.
 *
 * NÃO use este client para chamadas que escrevam na Amazon — este scaffold
 * é estritamente READ-ONLY (GET / operações de listagem).
 */
import { SellingPartner } from 'amazon-sp-api'
import { config } from '../config.js'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Singleton do SellingPartner. Lazy — só cria quando necessário. */
let _sp: SellingPartner | null = null

export function getSellingPartner(): SellingPartner {
  if (_sp) return _sp

  const credentials: ConstructorParameters<typeof SellingPartner>[0]['credentials'] = {
    SELLING_PARTNER_APP_CLIENT_ID: config.lwaClientId,
    SELLING_PARTNER_APP_CLIENT_SECRET: config.lwaClientSecret,
  }

  // AWS credentials são opcionais — necessárias para endpoints que exigem SigV4
  if (config.awsAccessKeyId && config.awsSecretAccessKey) {
    credentials.AWS_ACCESS_KEY_ID = config.awsAccessKeyId
    credentials.AWS_SECRET_ACCESS_KEY = config.awsSecretAccessKey
    if (config.awsRoleArn) {
      credentials.AWS_SELLING_PARTNER_ROLE = config.awsRoleArn
    }
  }

  _sp = new SellingPartner({
    region: config.spApiRegion,
    refresh_token: config.spApiRefreshToken,
    credentials,
    options: {
      auto_request_tokens: true,
      auto_request_throttled: false, // controlamos o retry manualmente (mais granular)
      version_fallback: false,
    },
  })

  return _sp
}

/**
 * Executa uma operação READ-ONLY na SP-API com retry/backoff em throttling.
 *
 * Throttling na SP-API:
 * - Catalog Items: ~2 req/s (burst 2, restore 2/s)
 * - Listings Items: ~5 req/s
 * - FBA Inventory: ~2 req/s
 * - Orders: ~0.0167 req/s (1 req/min!) — cuidado
 *
 * O SDK lança um Error com `code` = 'QuotaExceeded' ou HTTP 429 em throttling.
 * Aqui detectamos e aplicamos backoff exponencial com jitter.
 */
export async function spCall<T = unknown>(
  operation: string,
  opts: {
    endpoint?: string
    path?: Record<string, string>
    query?: Record<string, string | string[] | number | boolean | undefined>
  } = {},
): Promise<T> {
  const sp = getSellingPartner()
  const maxAttempts = 5

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await sp.callAPI({
        operation,
        endpoint: opts.endpoint,
        path: opts.path,
        query: opts.query,
      })
      return result as T
    } catch (err: unknown) {
      const isThrottled = isThrottlingError(err)

      if (isThrottled && attempt < maxAttempts) {
        // backoff exponencial com jitter: 1s, 2s, 4s, 8s (+até 1s aleatório)
        const backoff = Math.min(2 ** attempt * 500, 16_000) + Math.floor(Math.random() * 1000)
        console.error(
          `[sp-api] throttling em "${operation}" (tentativa ${attempt}/${maxAttempts}) — aguardando ${backoff}ms`,
        )
        await sleep(backoff)
        continue
      }

      // relança qualquer erro que não seja throttling, ou se esgotou tentativas
      const message = err instanceof Error ? err.message : String(err)
      throw new Error(`SP-API "${operation}" falhou${isThrottled ? ' (throttling esgotado)' : ''}: ${message}`)
    }
  }

  // nunca chegamos aqui — TypeScript satisfação
  throw new Error(`SP-API "${operation}": esgotou tentativas`)
}

function isThrottlingError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message.toLowerCase()
  // o SDK amz-tools expõe o código HTTP ou texto no message
  return (
    msg.includes('429') ||
    msg.includes('quotaexceeded') ||
    msg.includes('throttl') ||
    msg.includes('rate exceeded') ||
    msg.includes('too many requests')
  )
}
