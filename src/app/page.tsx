// src/app/page.tsx
'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useAnalyze } from '@/lib/hooks/useAnalyze'
import { UploadZone } from '@/components/features/UploadZone'
import { AnalysisResultView } from '@/components/features/AnalysisResult'
import { AnalyzingState } from '@/components/features/AnalyzingState'
import { AdBanner } from '@/components/ui/AdBanner'
import { PlanGate } from '@/components/features/PlanGate'
import { ManageSubscription } from '@/components/features/ManageSubscription'
import { AuthButton } from '@/components/features/AuthButton'
import type { CategoryId } from '@/types'

function PaymentToast() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [toast, setToast] = useState<'success' | 'cancel' | null>(null)

  useEffect(() => {
    const payment = searchParams.get('payment')
    if (payment === 'success' || payment === 'cancel') {
      setToast(payment)
      router.replace('/')
      if (payment === 'success') {
        const t = setTimeout(() => window.location.reload(), 5000)
        return () => clearTimeout(t)
      }
    }
  }, [searchParams, router])

  if (!toast) return null
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast === 'success' ? 'bg-green-600' : 'bg-gray-600'}`}>
      {toast === 'success'
        ? 'プラン反映まで少々お待ちください（自動更新します）'
        : '決済がキャンセルされました。'}
      <button onClick={() => setToast(null)} className="ml-3 opacity-70 hover:opacity-100">✕</button>
    </div>
  )
}

interface PendingAnalysis {
  files: File[]
  category: CategoryId
  question?: string
}

export default function HomePage() {
  const { state, analyze, reset } = useAnalyze()

  const [user, setUser]                   = useState<User | null | undefined>(undefined)
  const [oneTimeCredits, setCredits]      = useState(0)
  const [userPlan, setUserPlan]           = useState<'free' | 'sub_light' | 'sub_std'>('free')
  const [analysesRemaining, setRemaining] = useState<number | null>(null)
  const [pendingAnalysis, setPending]     = useState<PendingAnalysis | null>(null)
  const [showPromo, setShowPromo]         = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, setUser)
  }, [])

  useEffect(() => {
    if (!user) { setCredits(0); setUserPlan('free'); return }
    return onSnapshot(doc(db, 'users', user.uid), snap => {
      const data = snap.data()
      setCredits((data?.oneTimeCredits as number | undefined) ?? 0)
      setUserPlan((data?.plan as 'free' | 'sub_light' | 'sub_std' | undefined) ?? 'free')
    })
  }, [user])

  // 残回数を /api/remaining から取得（未ログイン・無料プランのみ）
  const fetchRemaining = useCallback(async () => {
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
      const idToken  = await auth.currentUser?.getIdToken() ?? null
      const headers: Record<string, string> = idToken ? { Authorization: `Bearer ${idToken}` } : {}
      const res  = await fetch(`${basePath}/api/remaining`, { headers, cache: 'no-store' })
      if (!res.ok) return
      const { remaining } = await res.json() as { remaining: number }
      setRemaining(remaining)
    } catch { /* サイレント */ }
  }, [])

  useEffect(() => {
    if (user === undefined) return          // 認証状態確定待ち
    if (oneTimeCredits > 0) { setRemaining(null); return }
    if (userPlan !== 'free' && user !== null) { setRemaining(null); return }
    fetchRemaining()
  }, [user, userPlan, oneTimeCredits, fetchRemaining])

  // 解析完了後に残回数を更新
  useEffect(() => {
    if (state.status === 'done' || state.status === 'error') fetchRemaining()
  }, [state.status, fetchRemaining])

  const isFreeTier = user !== undefined
    && (user === null || (userPlan === 'free' && oneTimeCredits === 0))

  const handleAnalyze = useCallback(
    (files: File[], category: CategoryId, question?: string) => {
      if (oneTimeCredits > 0) {
        setPending({ files, category, question })
        return
      }
      analyze(files, category, question)
    },
    [oneTimeCredits, analyze],
  )

  const confirmUseTicket = useCallback(() => {
    if (!pendingAnalysis) return
    const { files, category, question } = pendingAnalysis
    setPending(null)
    analyze(files, category, question)
  }, [pendingAnalysis, analyze])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="font-bold text-gray-900">契約書かんたん読み</span>
          </div>
          <div className="flex items-center gap-3">
            <ManageSubscription />
            <AuthButton />
          </div>
        </div>
      </header>

      {/* ── Payment toast ── */}
      <Suspense>
        <PaymentToast />
      </Suspense>

      {/* ── Main ── */}
      <main className="max-w-lg mx-auto px-4 py-6">

        {/* アイドル / アップロード・解析中 */}
        {state.status === 'idle' && (
          <div className="space-y-6">
            <div className="text-center space-y-1 py-4">
              <h1 className="text-xl font-bold text-gray-900">
                むずかしい契約書を<br />わかりやすく整理します
              </h1>
              <p className="text-sm text-gray-500">
                不動産・携帯・保険・ローン・雇用に対応
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <UploadZone
                onSubmit={handleAnalyze}
                isLoading={false}
                planBadge={isFreeTier ? (
                  <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800">
                        {user ? '無料プランをご利用中' : '無料でお試し中'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {analysesRemaining !== null
                          ? `今月あと ${analysesRemaining} 回 / 最大${user ? 20 : 10}枚まで`
                          : user ? '月1回・最大20枚まで' : '月1回・最大10枚まで'
                        }
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPromo(true)}
                      className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                    >
                      プランを見る →
                    </button>
                  </div>
                ) : undefined}
              />
            </div>

            {/* 使い方セクション */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">📖 かんたん3ステップ</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="w-10 h-10 mx-auto bg-indigo-50 rounded-full flex items-center justify-center text-lg mb-2">📄</div>
                  <p className="text-xs font-semibold text-gray-700">1. アップロード</p>
                  <p className="text-xs text-gray-500 mt-0.5">PDF・画像に対応</p>
                </div>
                <div>
                  <div className="w-10 h-10 mx-auto bg-indigo-50 rounded-full flex items-center justify-center text-lg mb-2">🤖</div>
                  <p className="text-xs font-semibold text-gray-700">2. AI解析</p>
                  <p className="text-xs text-gray-500 mt-0.5">数秒で完了</p>
                </div>
                <div>
                  <div className="w-10 h-10 mx-auto bg-indigo-50 rounded-full flex items-center justify-center text-lg mb-2">✅</div>
                  <p className="text-xs font-semibold text-gray-700">3. 結果表示</p>
                  <p className="text-xs text-gray-500 mt-0.5">わかりやすく整理</p>
                </div>
              </div>
            </div>

            {/* 対応書類セクション */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-3">📋 対応している契約書</h2>
              <div className="space-y-2">
                {[
                  { icon: '🏠', title: '不動産賃貸契約書', desc: '敷金・礼金・退去時の条件などを整理' },
                  { icon: '📱', title: '携帯電話の契約書', desc: '解約金・データ容量・オプションを確認' },
                  { icon: '🛡️', title: '保険の契約書', desc: '補償内容・免責事項・支払条件を解説' },
                  { icon: '🏦', title: 'ローン契約書', desc: '金利・返済条件・手数料を明確化' },
                  { icon: '💼', title: '雇用契約書', desc: '給与・勤務時間・休暇制度を確認' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-2">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 特徴セクション */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-3">✨ サービスの特徴</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span><strong>完全無料</strong> — 登録なしですぐに使えます</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span><strong>AIが専門用語を翻訳</strong> — 難しい法律用語をわかりやすい日本語に変換します</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span><strong>注意ポイントをハイライト</strong> — 見落としがちな重要事項を明示します</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span><strong>プライバシー保護</strong> — アップロードされたファイルは解析後すぐに削除されます</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span><strong>スマホ対応</strong> — パソコンでもスマートフォンでも快適に利用できます</span>
                </li>
              </ul>
            </div>

            {/* よくある質問 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-3">❓ よくある質問</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-800">Q. 本当に無料ですか？</p>
                  <p className="text-gray-600 mt-0.5">基本利用は無料です。会員登録なしで月1回（最大10枚）お試しいただけます。より多くご利用になりたい方には、月額¥300〜の有料プランもご用意しています。</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Q. アップロードした契約書は安全ですか？</p>
                  <p className="text-gray-600 mt-0.5">はい。ファイルはAI解析完了後に即時削除されます。第三者がアクセスすることはありません。</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Q. 解析結果はどのくらい正確ですか？</p>
                  <p className="text-gray-600 mt-0.5">AIによる参考情報です。重要な判断をされる場合は、弁護士などの専門家にご相談ください。</p>
                </div>
              </div>
              <Link href="/contact" className="block mt-3 text-sm text-indigo-600 hover:underline">
                → その他のよくある質問はこちら
              </Link>
            </div>

            {/* トップページ下部の広告 */}
            <AdBanner
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP ?? ''}
              format="horizontal"
              className="mt-2"
            />
          </div>
        )}

        {/* ローディング */}
        {(state.status === 'uploading' || state.status === 'analyzing') && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <AnalyzingState status={state.status} />
            </div>
            {/* 解析中は広告なし — コンテンツ体験を優先 */}
          </div>
        )}

        {/* エラー */}
        {state.status === 'error' && (
          <div className="space-y-4">
            {state.planRequired ? (
              <PlanGate
                reason={state.error ?? undefined}
                onClose={reset}
                existingOneTimeCredits={oneTimeCredits}
                currentPlan={user ? 'free' : 'anonymous'}
              />
            ) : state.serviceUnavailable ? (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
                  <p className="text-3xl">🔧</p>
                  <p className="font-bold text-amber-800 text-base">サービスが一時的に利用できません</p>
                  <p className="text-sm text-amber-700 leading-relaxed">{state.error}</p>
                  <div className="border-t border-amber-200 pt-3 text-xs text-amber-600 space-y-1">
                    <p>しばらく時間をおいてから再度お試しください。</p>
                    <p>
                      問題が解決しない場合は{' '}
                      <a href="/contact" className="underline font-medium hover:text-amber-800">
                        お問い合わせ
                      </a>
                      {' '}からご連絡ください。
                    </p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700"
                >
                  戻る
                </button>
              </>
            ) : (
              <>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
                  <p className="text-2xl mb-2">😔</p>
                  <p className="font-semibold text-red-700 mb-1">解析できませんでした</p>
                  <p className="text-sm text-red-600">{state.error}</p>
                </div>
                <button
                  onClick={reset}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700"
                >
                  もう一度試す
                </button>
              </>
            )}
          </div>
        )}

        {/* 結果表示 */}
        {state.status === 'done' && state.result && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <AnalysisResultView result={state.result} onReset={reset} />
          </div>
        )}

        {/* 広告枠（結果表示時） */}
        {state.status === 'done' && (
          <AdBanner
            slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULT ?? ''}
            format="auto"
            className="mt-4"
          />
        )}

      </main>

      {/* ── プランプロモモーダル（未登録・無料） ── */}
      {showPromo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowPromo(false) }}
        >
          <div className="w-full max-w-sm">
            <PlanGate
              variant="promo"
              currentPlan={user ? 'free' : 'anonymous'}
              onClose={() => setShowPromo(false)}
              existingOneTimeCredits={oneTimeCredits}
            />
          </div>
        </div>
      )}

      {/* ── チケット使用確認モーダル ── */}
      {pendingAnalysis && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setPending(null) }}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-5">
            <div className="text-center">
              <p className="text-3xl mb-2">🎟️</p>
              <h2 className="font-bold text-gray-900 text-lg">チケットを使用しますか？</h2>
              <p className="text-sm text-gray-500 mt-2">
                都度課金チケット（残り <span className="font-semibold text-gray-700">{oneTimeCredits}回</span>）を
                1回使用して解析します。
              </p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={confirmUseTicket}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 active:scale-95 transition-all"
              >
                使用して解析する
              </button>
              <button
                type="button"
                onClick={() => setPending(null)}
                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 mt-8">
        <div className="max-w-lg mx-auto px-4 py-6 text-center space-y-3">
          <nav className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <Link href="/about"   className="hover:text-gray-700">サービスについて</Link>
            <Link href="/terms"   className="hover:text-gray-700">利用規約</Link>
            <Link href="/privacy" className="hover:text-gray-700">プライバシーポリシー</Link>
            <Link href="/contact" className="hover:text-gray-700">お問い合わせ</Link>
          </nav>
          <p className="text-xs text-gray-400">© 2025 契約書かんたん読み</p>
          <p className="text-xs text-gray-400">本サービスはAIによる参考情報の提供であり、法的助言ではありません</p>
        </div>
      </footer>

    </div>
  )
}
