// src/app/api/stripe/checkout/route.ts

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { z } from 'zod'
import { stripe, STRIPE_PRICES, validateStripeConfig } from '@/lib/stripe'
import { verifyIdToken, adminDb } from '@/lib/firebase-admin'
import { logError } from '@/lib/logSafe'

const RequestSchema = z.object({
  priceKey: z.enum(['oneTime', 'subLight', 'subStd']),
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
    const isOneTime    = priceKey === 'oneTime'

    // 既存顧客を再利用（重複顧客・ポータル不整合を防ぐ）
    const userSnap = await adminDb.collection('users').doc(userId).get()
    const existingCustomerId = userSnap.data()?.stripeCustomerId as string | undefined

    const session = await stripe.checkout.sessions.create({
      mode:                isOneTime ? 'payment' : 'subscription',
      line_items:          [{ price: priceId, quantity: 1 }],
      success_url:         `${BASE_URL}/?payment=success`,
      cancel_url:          `${BASE_URL}/?payment=cancel`,
      client_reference_id: userId,
      metadata:            { userId, priceKey } as Record<string, string>,
      ...(existingCustomerId
        ? { customer: existingCustomerId }
        : { customer_creation: isOneTime ? 'always' : undefined }),
      ...(isOneTime
        ? {}
        : { subscription_data: { metadata: { userId, priceKey } as Record<string, string> } }),
    })

    return NextResponse.json({ url: session.url })

  } catch (err) {
    logError('stripe/checkout', err)
    return NextResponse.json(
      { error: '決済セッションの作成に失敗しました' },
      { status: 500 },
    )
  }
}
