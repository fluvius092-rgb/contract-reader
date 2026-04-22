// src/app/api/stripe/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { stripe, validateStripeConfig } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import type Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

// NOTE: 新規 checkout は subscription_data.metadata.userId を必ず設定する。
// 以下の customer 逆引きは旧実装（metadata 未設定）互換フォールバック。
async function resolveUserId(sub: Stripe.Subscription): Promise<string | undefined> {
  if (sub.metadata?.userId) return sub.metadata.userId
  const q = await adminDb.collection('users')
    .where('stripeCustomerId', '==', sub.customer as string)
    .limit(1).get()
  return q.docs[0]?.id
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET 未設定')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  try { validateStripeConfig() } catch (err) {
    console.error('[webhook] config error:', err)
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const body      = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (err) {
    console.error('[webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // 冪等性: 重複イベントは早期 return（記録はハンドラ成功後）
  const eventRef = adminDb.collection('stripeEvents').doc(event.id)
  const eventSnap = await eventRef.get()
  if (eventSnap.exists) {
    return NextResponse.json({ received: true, duplicated: true })
  }

  const stdPriceId   = process.env.STRIPE_PRICE_SUB_STD as string
  const lightPriceId = process.env.STRIPE_PRICE_SUB_LIGHT as string

  try {
    switch (event.type) {
      // 都度課金 完了
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status !== 'paid') break

        const userId   = session.metadata?.userId
        const priceKey = session.metadata?.priceKey
        if (!userId || !priceKey) break

        if (priceKey === 'oneTime') {
          const updates: Record<string, unknown> = {
            oneTimeCredits: FieldValue.increment(1),
            updatedAt: new Date(),
          }
          if (session.customer) updates.stripeCustomerId = session.customer as string
          await adminDb.collection('users').doc(userId).set(updates, { merge: true })
        }
        break
      }

      // サブスク 開始・更新
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub     = event.data.object as Stripe.Subscription
        const priceId = sub.items.data[0]?.price.id
        const userId  = await resolveUserId(sub)
        if (!userId) break

        const plan =
          priceId === stdPriceId   ? 'sub_std'   :
          priceId === lightPriceId ? 'sub_light' :
          null
        if (!plan) {
          console.warn('[webhook] 未知の priceId:', priceId)
          break
        }
        const status = sub.status === 'active' ? plan : 'free'

        await adminDb.collection('users').doc(userId).set(
          {
            plan:                status,
            stripeCustomerId:    sub.customer as string,
            stripeSubId:         sub.id,
            subCurrentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000),
            updatedAt:           new Date(),
          },
          { merge: true },
        )
        break
      }

      // サブスク キャンセル・失効
      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = await resolveUserId(sub)
        if (!userId) break

        await adminDb.collection('users').doc(userId).set(
          { plan: 'free', stripeSubId: null, updatedAt: new Date() },
          { merge: true },
        )
        break
      }
    }

    // ハンドラ成功後に冪等性キーを記録（失敗時は Stripe にリトライさせる）
    await eventRef.set({
      type: event.type,
      createdAt: new Date(),
      expireAt: new Date(Date.now() + THIRTY_DAYS_MS),
    })
    return NextResponse.json({ received: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[webhook] handler error:', msg, err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }
}
