// src/app/api/stripe/portal/route.ts
// サブスク管理（解約・プラン変更）用の Stripe Customer Portal

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { stripe } from '@/lib/stripe'
import { verifyIdToken, adminDb } from '@/lib/firebase-admin'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://settlabs.app/contract_reader'

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyIdToken(req)
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const snap = await adminDb.collection('users').doc(userId).get()
    const customerId = snap.data()?.stripeCustomerId as string | undefined

    if (!customerId) {
      return NextResponse.json(
        { error: '有効なサブスクリプションが見つかりません' },
        { status: 404 },
      )
    }

    const session = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: `${BASE_URL}/`,
    })

    return NextResponse.json({ url: session.url })

  } catch (err) {
    console.error('[stripe/portal]', err)
    return NextResponse.json(
      { error: 'ポータルセッションの作成に失敗しました' },
      { status: 500 },
    )
  }
}
