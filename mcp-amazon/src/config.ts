import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} ausente. Copie .env.example para .env e preencha (ver README.md — requer conta vendedor Amazon BR + app aprovado no Seller Central).`,
    )
  }
  return value
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined
}

export const config = {
  // Credenciais LWA (Login with Amazon) — geradas no Seller Central > Develop Apps
  lwaClientId: required('LWA_CLIENT_ID'),
  lwaClientSecret: required('LWA_CLIENT_SECRET'),

  // Refresh token LWA — obtido via self-authorization do app (ver authorize.ts)
  spApiRefreshToken: required('SP_API_REFRESH_TOKEN'),

  // Região SP-API. Brasil (Amazon.com.br) usa cluster "na" (us-east-1).
  // Clusters disponíveis: na | eu | fe
  spApiRegion: (optional('SP_API_REGION') ?? 'na') as 'na' | 'eu' | 'fe',

  // Marketplace ID do Brasil: A2Q3Y263D1QR3R
  // Outros: ATVPDKIKX0DER (US), A1AM78C64UM0Y8 (MX), A2EUQ1WTGCTBG2 (CA)
  marketplaceId: optional('SP_API_MARKETPLACE_ID') ?? 'A2Q3Y263D1QR3R',

  // (Opcional) AWS Role — necessário para alguns endpoints (ex.: Reports, Feeds)
  // Se em branco, o SDK usa o access token LWA diretamente (suficiente p/ leitura)
  awsAccessKeyId: optional('AWS_ACCESS_KEY_ID'),
  awsSecretAccessKey: optional('AWS_SECRET_ACCESS_KEY'),
  awsRoleArn: optional('AWS_ROLE_ARN'),
} as const
