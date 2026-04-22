// src/lib/stripe.ts
import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY が設定されていません')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

// 後方互換: 既存コードが `stripe.xxx` で直接使えるよう Proxy でラップ
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) { return Reflect.get(getStripe(), prop) },
})

// Stripe 商品・価格ID（Vercel 環境変数で設定）
export const STRIPE_PRICES = {
  oneTime:  process.env.STRIPE_PRICE_ONE_TIME!,   // 都度課金 ¥500
  subLight: process.env.STRIPE_PRICE_SUB_LIGHT!,  // サブスク ¥300/月
  subStd:   process.env.STRIPE_PRICE_SUB_STD!,    // サブスク ¥500/月
} as const

export type PriceKey = keyof typeof STRIPE_PRICES
