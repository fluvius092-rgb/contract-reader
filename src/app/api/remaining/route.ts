// src/app/api/remaining/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { adminDb, verifyIdToken } from '@/lib/firebase-admin'
import { getUserPlan, getPlanLimit, buildKey } from '@/lib/rateLimit'

export async function GET(req: NextRequest) {
  const ip     = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const userId = await verifyIdToken(req).catch(() => null)

  const { plan } = await getUserPlan(userId)
  const limit    = getPlanLimit(plan)
  const key      = buildKey(plan, ip, userId)

  const snap      = await adminDb.collection('rateLimits').doc(key).get()
  const count     = (snap.data()?.count as number | undefined) ?? 0
  const remaining = Math.max(0, limit.analyses - count)

  return NextResponse.json(
    { remaining, limit: limit.analyses },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
