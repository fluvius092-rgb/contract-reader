// 一時デバッグ用：Stripe 設定・接続を検証
// ⚠️ 動作確認後すぐに削除すること

import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const secret    = process.env.STRIPE_SECRET_KEY ?? ''
  const subLight  = process.env.STRIPE_PRICE_SUB_LIGHT ?? ''
  const subStd    = process.env.STRIPE_PRICE_SUB_STD ?? ''
  const webhook   = process.env.STRIPE_WEBHOOK_SECRET ?? ''

  const env = {
    secretKey:        { present: !!secret, length: secret.length, mode: secret.startsWith('sk_live_') ? 'live' : secret.startsWith('sk_test_') ? 'test' : 'unknown' },
    priceSubLight:    { present: !!subLight, value: subLight ? `${subLight.substring(0, 12)}...` : '' },
    priceSubStd:      { present: !!subStd, value: subStd ? `${subStd.substring(0, 12)}...` : '' },
    webhookSecret:    { present: !!webhook, length: webhook.length },
  }

  if (!secret) {
    return NextResponse.json({ env, error: 'STRIPE_SECRET_KEY not set' })
  }

  try {
    const stripe = new Stripe(secret, { apiVersion: '2026-03-25.dahlia' })

    const result: Record<string, unknown> = { env }

    // 1. アカウント取得（疎通確認）
    try {
      const acct = await stripe.accounts.retrieve()
      result.account = { id: acct.id, country: acct.country, chargesEnabled: acct.charges_enabled, detailsSubmitted: acct.details_submitted }
    } catch (e) {
      result.accountError = (e as Error).message
    }

    // 2. 各 priceId が有効か検証
    if (subLight) {
      try {
        const p = await stripe.prices.retrieve(subLight)
        result.subLightPrice = { id: p.id, active: p.active, currency: p.currency, unitAmount: p.unit_amount, type: p.type, recurring: p.recurring }
      } catch (e) {
        result.subLightPriceError = (e as Error).message
      }
    }
    if (subStd) {
      try {
        const p = await stripe.prices.retrieve(subStd)
        result.subStdPrice = { id: p.id, active: p.active, currency: p.currency, unitAmount: p.unit_amount, type: p.type, recurring: p.recurring }
      } catch (e) {
        result.subStdPriceError = (e as Error).message
      }
    }

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ env, error: (err as Error).message })
  }
}
