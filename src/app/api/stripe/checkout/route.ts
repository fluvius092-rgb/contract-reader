// src/app/api/stripe/checkout/route.ts

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { z } from 'zod'
import { stripe, STRIPE_PRICES, validateStripeConfig } from '@/lib/stripe'
import { verifyIdToken, adminDb } from '@/lib/firebase-admin'
import { logError } from '@/lib/logSafe'

const RequestSchema = z.object({
  priceKey: z.enum(['subLight', 'subStd']),
})

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://settlabs.app/contract_reader'

export async function POST(req: NextRequest) {
  try {
    validateStripeConfig()
    const userId = await verifyIdToken(req)
    if (!userId) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 },
      )
    }

    let body: unknown
    try { body = await req.json() } catch {
      return NextResponse.json({ error: 'リクエストの形式が正しくありません' }, { status: 400 })
    }
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'リクエストの形式が正しくありません' }, { status: 400 })
    }

    const { priceKey } = parsed.data
    const priceId      = STRIPE_PRICES[priceKey]

    // 既存顧客を再利用（重複顧客・ポータル不整合を防ぐ）
    const userSnap = await adminDb.collection('users').doc(userId).get()
    const existingCustomerId = userSnap.data()?.stripeCustomerId as string | undefined

    const session = await stripe.checkout.sessions.create({
      mode:                'subscription',
      line_items:          [{ price: priceId, quantity: 1 }],
      success_url:         `${BASE_URL}/?payment=success`,
      cancel_url:          `${BASE_URL}/?payment=cancel`,
      client_reference_id: userId,
      metadata:            { userId, priceKey } as Record<string, string>,
      subscription_data:   { metadata: { userId, priceKey } as Record<string, string> },
      ...(existingCustomerId ? { customer: existingCustomerId } : {}),
    })

    return NextResponse.json({ url: session.url })

  } catch (err) {
    logError('stripe/checkout', err)
    const e = err as { name?: string; message?: string; type?: string; code?: string; statusCode?: number; stack?: string }
    return NextResponse.json(
      {
        error: '決済セッションの作成に失敗しました',
        _debug: {
          name:       e.name,
          message:    e.message,
          type:       e.type,
          code:       e.code,
          statusCode: e.statusCode,
          stack:      e.stack?.split('\n').slice(0, 5).join('\n'),
        },
      },
      { status: 500 },
    )
  }
}
