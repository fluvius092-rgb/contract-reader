// src/lib/stripe.ts
import Stripe from 'stripe'

const REQUIRED_ENV = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ONE_TIME',
  'STRIPE_PRICE_SUB_LIGHT',
  'STRIPE_PRICE_SUB_STD',
] as const

export function validateStripeConfig(): void {
  const missing = REQUIRED_ENV.filter(k => !process.env[k])
  if (missing.length > 0) {
    throw new Error(`Stripe 設定不足: ${missing.join(', ')}`)
  }
}

let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) {
    validateStripeConfig()
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) { return Reflect.get(getStripe(), prop) },
})

// 価格 ID は getter で遅延解決（validateStripeConfig() 通過後に安全な値を返す）
export const STRIPE_PRICES = {
  get oneTime()  { return process.env.STRIPE_PRICE_ONE_TIME as string },
  get subLight() { return process.env.STRIPE_PRICE_SUB_LIGHT as string },
  get subStd()   { return process.env.STRIPE_PRICE_SUB_STD as string },
} as const

export type PriceKey = 'oneTime' | 'subLight' | 'subStd'
