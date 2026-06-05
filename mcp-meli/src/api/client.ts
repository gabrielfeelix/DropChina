import { config } from '../config.js'
import { getValidAccessToken } from '../auth/oauth.js'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * GET autenticado contra a API do ML. Somente leitura.
 * - injeta Bearer token válido (refresh transparente)
 * - 401 → renova token e tenta 1x de novo
 * - 429 → backoff exponencial com jitter
 */
export async function mlGet<T = unknown>(
  path: string,
  query: Record<string, string | number | undefined> = {},
): Promise<T> {
  const url = new URL(path.startsWith('http') ? path : config.apiBase + path)
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined) url.searchParams.set(k, String(v))
  }

  const maxAttempts = 5
  let attempt = 0
  let triedRefresh = false

  for (;;) {
    attempt += 1
    const token = await getValidAccessToken()
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
    })

    if (res.ok) return (await res.json()) as T

    if (res.status === 401 && !triedRefresh) {
      // força refresh marcando expiração — getValidAccessToken renova na próxima
      triedRefresh = true
      // pequena espera e retry (o token pode ter expirado entre chamadas)
      await sleep(300)
      continue
    }

    if (res.status === 429 && attempt < maxAttempts) {
      const backoff = Math.min(2 ** attempt * 500, 8000) + Math.floor(Math.random() * 400)
      await sleep(backoff)
      continue
    }

    const body = await res.text()
    throw new Error(`ML GET ${url.pathname} → ${res.status}: ${body.slice(0, 400)}`)
  }
}
