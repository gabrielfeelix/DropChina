import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} ausente. Copie .env.example para .env e preencha (ver 00_Checklist_DevCenter_ML.md).`,
    )
  }
  return value
}

export const config = {
  clientId: required('MELI_CLIENT_ID'),
  clientSecret: required('MELI_CLIENT_SECRET'),
  redirectUri: required('MELI_REDIRECT_URI'),

  // Brasil (MLB). Domínio de autorização é por país; API é único.
  authorizeUrl: 'https://auth.mercadolivre.com.br/authorization',
  tokenUrl: 'https://api.mercadolibre.com/oauth/token',
  apiBase: 'https://api.mercadolibre.com',
  siteId: 'MLB',
} as const
