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

    // 1. balance.retrieve で疎通確認
    try {
      const bal = await stripe.balance.retrieve()
      result.balance = { available: bal.available.length, livemode: bal.livemode }
    } catch (e) {
      result.balanceError = (e as Error).message
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

    // 3. 実際の checkout.sessions.create を試す
    if (subLight) {
      try {
        const session = await stripe.checkout.sessions.create({
          mode:                'subscription',
          line_items:          [{ price: subLight, quantity: 1 }],
          success_url:         'https://settlabs.app/contract_reader/?payment=success',
          cancel_url:          'https://settlabs.app/contract_reader/?payment=cancel',
          client_reference_id: 'debug-test-user',
          metadata:            { userId: 'debug-test-user', priceKey: 'subLight' },
          subscription_data:   { metadata: { userId: 'debug-test-user', priceKey: 'subLight' } },
        })
        result.checkoutTest = { id: session.id, hasUrl: !!session.url }
      } catch (e) {
        const err = e as { name?: string; message?: string; type?: string; code?: string; statusCode?: number; raw?: unknown }
        result.checkoutTestError = {
          name:       err.name,
          message:    err.message,
          type:       err.type,
          code:       err.code,
          statusCode: err.statusCode,
          raw:        err.raw,
        }
      }
    }

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ env, error: (err as Error).message })
  }
}
