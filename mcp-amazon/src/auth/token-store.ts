/**
 * token-store.ts — persistência local do refresh_token LWA.
 *
 * NOTA: Ao contrário do mcp-meli (onde gerenciamos o access_token manualmente),
 * o SDK `amazon-sp-api` gerencia o access_token a partir do refresh_token LWA
 * de forma transparente — troca o refresh_token por um access_token em cada
 * instância do SellingPartner. Portanto, este token-store é mais simples:
 * só persiste/lê o refresh_token para não precisar repassar via env toda vez.
 * O access_token NÃO é armazenado aqui (o SDK cuida disso internamente).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TOKENS_PATH = join(__dirname, '..', '..', 'tokens.json')

export interface SpTokens {
  /** Refresh token LWA — longa duração (não expira por padrão, a menos que revogado). */
  refresh_token: string
  /** Timestamp (epoch ms) em que foi salvo — apenas informativo. */
  saved_at: number
  /** Marketplace ID vinculado ao token — informativo. */
  marketplace_id?: string
}

export function readTokens(): SpTokens | null {
  if (!existsSync(TOKENS_PATH)) return null
  try {
    return JSON.parse(readFileSync(TOKENS_PATH, 'utf8')) as SpTokens
  } catch {
    return null
  }
}

/** Persiste tokens com permissão restrita (0600). */
export function writeTokens(tokens: SpTokens): void {
  writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2), { mode: 0o600 })
}

export function tokensPath(): string {
  return TOKENS_PATH
}
