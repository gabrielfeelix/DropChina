import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TOKENS_PATH = join(__dirname, '..', '..', 'tokens.json')

export interface Tokens {
  access_token: string
  refresh_token: string
  /** epoch ms em que o access_token expira. */
  expires_at: number
  user_id?: number
  scope?: string
}

export function readTokens(): Tokens | null {
  if (!existsSync(TOKENS_PATH)) return null
  try {
    return JSON.parse(readFileSync(TOKENS_PATH, 'utf8')) as Tokens
  } catch {
    return null
  }
}

/** Persiste tokens com permissão restrita (0600). O refresh do ML é rotativo:
 *  sempre salve o refresh_token NOVO recebido em cada refresh. */
export function writeTokens(tokens: Tokens): void {
  writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2), { mode: 0o600 })
}

export function tokensPath(): string {
  return TOKENS_PATH
}
