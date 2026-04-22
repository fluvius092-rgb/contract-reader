// src/lib/rateLimit.ts

import { adminDb } from '@/lib/firebase-admin'

// ── 短期スロットリング（インメモリ、IP ベース）────────────
const ipRequestMap = new Map<string, { count: number; resetAt: number }>()
const BURST_WINDOW_MS = 60 * 1000
const BURST_MAX       = 5

export function checkBurstLimit(ip: string): { ok: boolean; retryAfter?: number } {
  const now  = Date.now()
  const data = ipRequestMap.get(ip)

  if (!data || now > data.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + BURST_WINDOW_MS })
    return { ok: true }
  }
  if (data.count >= BURST_MAX) {
    return { ok: false, retryAfter: Math.ceil((data.resetAt - now) / 1000) }
  }
  data.count++
  return { ok: true }
}

// 古いエントリを定期削除
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, data] of ipRequestMap.entries()) {
      if (now > data.resetAt) ipRequestMap.delete(ip)
    }
  }, 5 * 60 * 1000)
}

// ── プラン定義 ────────────────────────────────────────────
export type Plan = 'anonymous' | 'free' | 'one_time' | 'sub_light' | 'sub_std'

interface PlanLimit {
  analyses: number  // 解析回数/月
  pages:    number  // 最大ページ数/回
  window:   'day' | 'month'
}

const PLAN_LIMITS: Record<Plan, PlanLimit> = {
  anonymous: { analyses: 1,  pages: 1,  window: 'day'   },
  free:      { analyses: 3,  pages: 1,  window: 'month' },
  one_time:  { analyses: 1,  pages: 60, window: 'month' },  // 1クレジット = 1回
  sub_light: { analyses: 3,  pages: 20, window: 'month' },
  sub_std:   { analyses: 5,  pages: 20, window: 'month' },
}

// ── 日次・月次カウンター（Firestore）─────────────────────
// パス: rateLimits/{key}
//   key = "ip_{ip}_{YYYY-MM-DD}" or "uid_{uid}_{YYYY-MM}" or "uid_{uid}_{YYYY-MM-DD}"

function todayJST(): string {
  return new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\//g, '-')
}

function thisMonthJST(): string {
  return new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit',
  }).replace(/\//g, '-')
}

function buildKey(plan: Plan, ip: string, uid: string | null): string {
  if (plan === 'anonymous') return `ip_${ip}_${todayJST()}`
  // サブスク・都度課金は月次キー、無料は日次キー
  if (plan === 'sub_std' || plan === 'sub_light' || plan === 'one_time') {
    return `uid_${uid}_${thisMonthJST()}`
  }
  return `uid_${uid}_${todayJST()}`
}

export async function getUserPlan(
  uid: string | null,
): Promise<{ plan: Plan; oneTimeCredits: number }> {
  if (!uid) return { plan: 'anonymous', oneTimeCredits: 0 }
  try {
    const snap = await adminDb.collection('users').doc(uid).get()
    const data = snap.data()
    const credits = (data?.oneTimeCredits as number | undefined) ?? 0
    const raw = data?.plan as string | undefined
    const validPlans: Plan[] = ['sub_light', 'sub_std']
    const plan: Plan =
      credits > 0 ? 'one_time'
      : (raw && validPlans.includes(raw as Plan)) ? (raw as Plan)
      : 'free'
    return { plan, oneTimeCredits: credits }
  } catch {
    return { plan: 'free', oneTimeCredits: 0 }
  }
}

export function getPlanLimit(plan: Plan): PlanLimit {
  return PLAN_LIMITS[plan]
}

export async function checkDailyLimit(
  ip: string,
  uid: string | null,
): Promise<{ ok: boolean; plan: Plan; remaining: number; retryAfter?: string; maxPages: number }> {
  const { plan, oneTimeCredits } = await getUserPlan(uid)
  const limit = PLAN_LIMITS[plan]

  // 都度課金: クレジットをトランザクションで減算
  if (plan === 'one_time' && uid) {
    const ref = adminDb.collection('users').doc(uid)
    try {
      await adminDb.runTransaction(async tx => {
        const snap = await tx.get(ref)
        const cur = (snap.data()?.oneTimeCredits as number | undefined) ?? 0
        if (cur <= 0) throw new Error('NO_CREDIT')
        tx.update(ref, { oneTimeCredits: cur - 1, updatedAt: new Date() })
      })
      return { ok: true, plan, remaining: oneTimeCredits - 1, maxPages: limit.pages }
    } catch {
      // クレジット枯渇 → free として再評価
      return checkDailyLimit(ip, uid)
    }
  }

  // 既存の日次/月次カウンターロジック
  const key  = buildKey(plan, ip, uid)
  const ref  = adminDb.collection('rateLimits').doc(key)
  const snap = await ref.get()
  const count: number = snap.data()?.count ?? 0

  if (count >= limit.analyses) {
    const retryAfter = limit.window === 'day' ? '明日0時（JST）' : '来月1日'
    return { ok: false, plan, remaining: 0, retryAfter, maxPages: limit.pages }
  }

  await ref.set({ count: count + 1 }, { merge: true })
  return { ok: true, plan, remaining: limit.analyses - count - 1, maxPages: limit.pages }
}

// ── 後方互換エクスポート（既存 route.ts が import している場合用）──
export const checkRateLimit = checkBurstLimit
