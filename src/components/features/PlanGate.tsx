'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import clsx from 'clsx'

// ── 全プラン定義 ──────────────────────────────────────
type PlanKey = 'anonymous' | 'free' | 'oneTime' | 'subLight' | 'subStd'

interface PlanDef {
  key:          PlanKey
  label:        string
  price:        string
  analyses:     string
  pages:        string
  badge?:       string
  cta?:         'register' | 'checkout'
  priceKey?:    string
  highQuality?: boolean
}

const ALL_PLANS: PlanDef[] = [
  {
    key:         'subStd',
    label:       'スタンダード',
    price:       '¥500/月',
    analyses:    '月5回',
    pages:       '最大20枚',
    badge:       'おすすめ',
    cta:         'checkout',
    priceKey:    'subStd',
    highQuality: true,
  },
  {
    key:         'subLight',
    label:       'ライト',
    price:       '¥300/月',
    analyses:    '月3回',
    pages:       '最大20枚',
    cta:         'checkout',
    priceKey:    'subLight',
    highQuality: true,
  },
  {
    key:         'oneTime',
    label:       '都度課金',
    price:       '¥500',
    analyses:    '1回',
    pages:       '最大60枚',
    cta:         'checkout',
    priceKey:    'oneTime',
    highQuality: true,
  },
  {
    key:      'free',
    label:    '無料登録',
    price:    '無料',
    analyses: '月1回',
    pages:    '最大20枚',
    cta:      'register',
  },
  {
    key:      'anonymous',
    label:    '未登録',
    price:    '無料',
    analyses: '月1回',
    pages:    '最大10枚',
  },
]

// ── Props ────────────────────────────────────────────
interface Props {
  reason?: string
  onClose?: () => void
  existingOneTimeCredits?: number
  variant?: 'limit' | 'promo'
  currentPlan?: 'anonymous' | 'free'
}

export function PlanGate({ reason, onClose, existingOneTimeCredits = 0, variant = 'limit', currentPlan = 'anonymous' }: Props) {
  const router = useRouter()
  const [loading, setLoading]              = useState<string | null>(null)
  const [error, setError]                  = useState<string | null>(null)
  const [confirmingOneTime, setConfirming] = useState(false)

  const proceedCheckout = async (priceKey: string) => {
    setLoading(priceKey)
    setError(null)
    try {
      const idToken = await auth.currentUser?.getIdToken()
      if (!idToken) {
        setError('ログインが必要です')
        setLoading(null)
        return
      }
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
      const res = await fetch(`${basePath}/api/stripe/checkout`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body:    JSON.stringify({ priceKey }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg ?? '決済の開始に失敗しました')
      }
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : '決済の開始に失敗しました')
      setLoading(null)
    }
  }

  const handleCta = (plan: PlanDef) => {
    if (!plan.cta) return
    if (plan.cta === 'register') {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
      router.push(`${basePath}/auth`)
      return
    }
    if (plan.priceKey === 'oneTime' && existingOneTimeCredits > 0) {
      setConfirming(true)
      return
    }
    proceedCheckout(plan.priceKey!)
  }

  // ── チケット追加確認 ────────────────────────────────
  if (confirmingOneTime) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <div className="text-center">
          <p className="text-2xl mb-1">🎟️</p>
          <h2 className="font-bold text-gray-900">チケットが残っています</h2>
          <p className="text-sm text-gray-500 mt-2">
            現在 <span className="font-semibold text-gray-700">{existingOneTimeCredits}回分</span> の都度課金チケットが残っています。
            <br />追加でチケットを購入しますか？
          </p>
        </div>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => { setConfirming(false); proceedCheckout('oneTime') }}
            disabled={!!loading}
            className={clsx(
              'w-full py-3 rounded-xl font-semibold text-sm transition-all border-2 border-gray-900 bg-gray-900 text-white hover:bg-gray-700',
              loading === 'oneTime' && 'opacity-60 cursor-not-allowed',
            )}
          >
            {loading === 'oneTime' ? '決済ページへ移動中...' : '追加購入する（¥500）'}
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600">
            戻る
          </button>
        </div>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>
    )
  }

  // ── メイン ──────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">

      {/* ヘッダー */}
      {variant === 'promo' ? (
        <div className="text-center">
          <p className="text-2xl mb-1">📊</p>
          <h2 className="font-bold text-gray-900">プランを比較する</h2>
          <p className="text-sm text-gray-500 mt-1">現在のプランより多く使いたい方へ</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-2xl mb-1">📋</p>
          <h2 className="font-bold text-gray-900">利用上限に達しました</h2>
          {reason && <p className="text-sm text-gray-500 mt-1">{reason}</p>}
        </div>
      )}

      {/* 比較カード（縦リスト） */}
      <div className="space-y-2">
        {ALL_PLANS.map(plan => {
          const isCurrent = plan.key === currentPlan
          const isPaid    = plan.cta === 'checkout'
          const isRec     = !!plan.badge

          return (
            <div
              key={plan.key}
              className={clsx(
                'relative rounded-xl border-2 px-3 py-2.5',
                isCurrent ? 'border-indigo-400 bg-indigo-50'
                : isRec   ? 'border-blue-400 bg-blue-50'
                :           'border-gray-200 bg-white',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                {/* 左: プラン名 + スペック */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className={clsx('text-sm font-bold', isCurrent ? 'text-indigo-700' : 'text-gray-800')}>
                      {plan.label}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full">現在</span>
                    )}
                    {isRec && !isCurrent && (
                      <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full">{plan.badge}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {plan.analyses}・{plan.pages}
                    {plan.highQuality && (
                      <span className="ml-1.5 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1 py-0.5">
                        高精度
                      </span>
                    )}
                  </p>
                </div>

                {/* 右: 価格 + CTA */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className={clsx('text-sm font-extrabold', isPaid ? 'text-gray-900' : 'text-green-600')}>
                    {plan.price}
                  </p>
                  {plan.cta && !isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleCta(plan)}
                      disabled={!!loading}
                      className={clsx(
                        'py-1.5 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                        isPaid
                          ? isRec
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-900 text-white hover:bg-gray-700'
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
                        loading === plan.priceKey && 'opacity-60 cursor-not-allowed',
                      )}
                    >
                      {loading === plan.priceKey
                        ? '移動中...'
                        : plan.cta === 'register'   ? '登録する'
                        : plan.priceKey === 'oneTime' ? '購入する'
                        : '加入する'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <p className="text-xs text-gray-400 text-center">
        Stripe による安全な決済。サブスクはいつでも解約できます。
      </p>

      {onClose && (
        <button type="button" onClick={onClose} className="w-full text-sm text-gray-400 hover:text-gray-600">
          閉じる
        </button>
      )}
    </div>
  )
}
