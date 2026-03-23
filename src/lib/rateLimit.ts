// src/lib/rateLimit.ts
// 簡易レートリミット（IP ベース）
// 本番では Upstash Redis などを使うことを推奨

const ipRequestMap = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS  = 60 * 1000  // 1分
const MAX_REQS   = 5           // 1分あたり最大5件（1ユーザー = 複数ページのPDF想定）

export function checkRateLimit(ip: string): { ok: boolean; retryAfter?: number } {
  const now  = Date.now()
  const data = ipRequestMap.get(ip)

  if (!data || now > data.resetAt) {
    // 新しいウィンドウ開始
    ipRequestMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { ok: true }
  }

  if (data.count >= MAX_REQS) {
    return {
      ok: false,
      retryAfter: Math.ceil((data.resetAt - now) / 1000),
    }
  }

  data.count++
  return { ok: true }
}

// 古いエントリを定期的に削除（メモリリーク防止）
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, data] of ipRequestMap.entries()) {
      if (now > data.resetAt) ipRequestMap.delete(ip)
    }
  }, 5 * 60 * 1000) // 5分ごと
}
