// src/app/page.tsx
'use client'

import { useAnalyze } from '@/lib/hooks/useAnalyze'
import { UploadZone } from '@/components/features/UploadZone'
import { AnalysisResultView } from '@/components/features/AnalysisResult'
import { AnalyzingState } from '@/components/features/AnalyzingState'
import { AdBanner } from '@/components/ui/AdBanner'

export default function HomePage() {
  const { state, analyze, reset } = useAnalyze()

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="font-bold text-gray-900">契約書かんたん読み</span>
          </div>
          <span className="text-xs text-gray-400">無料・広告掲載</span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-lg mx-auto px-4 py-6">

        {/* アイドル / アップロード・解析中 */}
        {state.status === 'idle' && (
          <div className="space-y-4">
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
                onSubmit={analyze}
                isLoading={false}
              />
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
            {/* 解析中の広告 */}
            <AdBanner
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ANALYZING ?? ''}
              format="rectangle"
              className="mt-2"
            />
          </div>
        )}

        {/* エラー */}
        {state.status === 'error' && (
          <div className="space-y-4">
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

      {/* ── Footer ── */}
      <footer className="text-center py-8 text-xs text-gray-400 space-y-1">
        <p>© 2025 契約書かんたん読み</p>
        <p>本サービスはAIによる参考情報の提供であり、法的助言ではありません</p>
      </footer>

    </div>
  )
}
