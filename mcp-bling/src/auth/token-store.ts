import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TOKENS_PATH = resolve(__dirname, '../../tokens.json')

export interface StoredTokens {
  access_token: string
  refresh_token: string
  /** Epoch em ms de quando o access_token expira. */
  expires_at: number
  scope?: string
}

export async function loadTokens(): Promise<StoredTokens | null> {
  try {
    const raw = await readFile(TOKENS_PATH, 'utf8')
    return JSON.parse(raw) as StoredTokens
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err
  }
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await writeFile(TOKENS_PATH, JSON.stringify(tokens, null, 2) + '\n', {
    mode: 0o600, // só o dono lê/escreve
  })
}

/** Constrói StoredTokens a partir da resposta do endpoint /oauth/token. */
export function fromTokenResponse(res: {
  access_token: string
  refresh_token: string
  expires_in: number
  scope?: string
}): StoredTokens {
  return {
    access_token: res.access_token,
    refresh_token: res.refresh_token,
    expires_at: Date.now() + res.expires_in * 1000,
    scope: res.scope,
  }
}
