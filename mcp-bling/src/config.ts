import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} ausente. Copie .env.example para .env e preencha (ver 00_Checklist_Pre_Requisitos_Bling.md).`,
    )
  }
  return value
}

export const config = {
  clientId: required('BLING_CLIENT_ID'),
  clientSecret: required('BLING_CLIENT_SECRET'),
  redirectUri: process.env.BLING_REDIRECT_URI ?? 'http://localhost:3000/callback',

  // Endpoints oficiais da API v3 (developer.bling.com.br)
  authorizeUrl: 'https://www.bling.com.br/Api/v3/oauth/authorize',
  tokenUrl: 'https://api.bling.com.br/Api/v3/oauth/token',
} as const

/** Porta do servidor de callback, derivada do redirect_uri. */
export function callbackPort(): number {
  try {
    return Number(new URL(config.redirectUri).port || '3000')
  } catch {
    return 3000
  }
}
