import { createHmac } from 'node:crypto'
import { config } from '../config.js'

/**
 * Gera a assinatura HMAC-SHA256 para APIs públicas da Shopee (sem loja).
 * Base string: partner_id + api_path + timestamp
 *
 * Usado em endpoints como /api/v2/auth/token/get.
 */
export function signPublic(apiPath: string, timestamp: number): string {
  const base = `${config.partnerId}${apiPath}${timestamp}`
  return createHmac('sha256', config.partnerKey).update(base).digest('hex')
}

/**
 * Gera a assinatura HMAC-SHA256 para APIs de loja (shop-level).
 * Base string: partner_id + api_path + timestamp + access_token + shop_id
 *
 * Usado em endpoints de produto, pedido etc.
 */
export function signShop(
  apiPath: string,
  timestamp: number,
  accessToken: string,
  shopId: number,
): string {
  const base = `${config.partnerId}${apiPath}${timestamp}${accessToken}${shopId}`
  return createHmac('sha256', config.partnerKey).update(base).digest('hex')
}

/** Retorna o timestamp Unix em segundos (inteiro). */
export function unixNow(): number {
  return Math.floor(Date.now() / 1000)
}
