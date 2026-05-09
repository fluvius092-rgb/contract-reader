// src/app/api/stripe/sync/route.ts
// 認証済みユーザーが叩くと、Stripe から現在のサブスク状態を取得して Firestore に反映する
// Webhook 取りこぼし時のリカバリ用途

import { NextRequest, NextResponse } from 'next/server'
import { stripe, validateStripeConfig } from '@/lib/stripe'
import { adminDb, verifyIdToken } from '@/lib/firebase-admin'
import { logError } from '@/lib/logSafe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    validateStripeConfig()
    const userId = await verifyIdToken(req)
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const userRef  = adminDb.collection('users').doc(userId)
    const userSnap = await userRef.get()
    const data     = userSnap.data() ?? {}

    const customerId = data.stripeCustomerId as string | undefined
    if (!customerId) {
      return NextResponse.json({ ok: true, plan: data.plan ?? 'free', synced: false, reason: 'no customer' })
    }

    // 該当顧客のアクティブなサブスクを取得（最新1件）
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status:   'all',
      limit:    1,
    })
    const sub = subs.data[0]
    if (!sub) {
      // サブスクなし → free に戻す
      await userRef.set(
        {
          plan:              'free',
          stripeSubId:       null,
          cancelAtPeriodEnd: false,
          currentPeriodEnd:  null,
          updatedAt:         new Date(),
        },
        { merge: true },
      )
      return NextResponse.json({ ok: true, plan: 'free', synced: true })
    }

    const item    = sub.items.data[0]
    const priceId = item?.price.id

    const stdPriceId   = process.env.STRIPE_PRICE_SUB_STD   as string
    const lightPriceId = process.env.STRIPE_PRICE_SUB_LIGHT as string
    const planFromPrice =
      priceId === stdPriceId   ? 'sub_std'   :
      priceId === lightPriceId ? 'sub_light' :
      null

    const plan = (sub.status === 'active' || sub.status === 'trialing') && planFromPrice
      ? planFromPrice
      : 'free'

    const periodEndUnix =
      (sub as unknown as { current_period_end?: number }).current_period_end
      ?? (item as unknown as { current_period_end?: number } | undefined)?.current_period_end

    const updates: Record<string, unknown> = {
      plan,
      stripeCustomerId:   sub.customer as string,
      stripeSubId:        sub.id,
      cancelAtPeriodEnd:  !!sub.cancel_at_period_end,
      updatedAt:          new Date(),
    }
    if (typeof periodEndUnix === 'number' && Number.isFinite(periodEndUnix)) {
      updates.currentPeriodEnd = new Date(periodEndUnix * 1000)
    } else {
      updates.currentPeriodEnd = null
    }

    await userRef.set(updates, { merge: true })

    return NextResponse.json({ ok: true, plan, synced: true })

  } catch (err) {
    logError('stripe/sync', err)
    return NextResponse.json({ error: '同期に失敗しました' }, { status: 500 })
  }
}
