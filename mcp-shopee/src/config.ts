import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} ausente. Copie .env.example para .env e preencha (ver README.md).`,
    )
  }
  return value
}

// Host da API varia por ambiente (prod vs sandbox)
const region = process.env['SHOPEE_REGION'] ?? 'prod'
const apiBase =
  region === 'sandbox'
    ? 'https://partner.test-stable.shopeemobile.com'
    : 'https://partner.shopeemobile.com'

export const config = {
  partnerId: Number(required('SHOPEE_PARTNER_ID')),
  partnerKey: required('SHOPEE_PARTNER_KEY'),
  shopId: Number(required('SHOPEE_SHOP_ID')),
  redirectUri: required('SHOPEE_REDIRECT_URI'),

  apiBase,
  region,

  // Endpoints de autenticação (Shopee Open Platform v2)
  tokenUrl: `${apiBase}/api/v2/auth/token/get`,
  refreshUrl: `${apiBase}/api/v2/auth/access_token/get`,
  authorizeBasePath: '/api/v2/shop/auth_partner',
} as const
