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
                onSubmit={analyze}
                isLoading={false}
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
                  <p className="text-gray-600 mt-0.5">はい、完全無料でご利用いただけます。広告収入により運営しています。</p>
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
              <a href="/contact" className="block mt-3 text-sm text-indigo-600 hover:underline">
                → その他のよくある質問はこちら
              </a>
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
      <footer className="border-t border-gray-200 mt-8">
        <div className="max-w-lg mx-auto px-4 py-6 text-center space-y-3">
          <nav className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <a href="/about" className="hover:text-gray-700">サービスについて</a>
            <a href="/terms" className="hover:text-gray-700">利用規約</a>
            <a href="/privacy" className="hover:text-gray-700">プライバシーポリシー</a>
            <a href="/contact" className="hover:text-gray-700">お問い合わせ</a>
          </nav>
          <p className="text-xs text-gray-400">© 2025 契約書かんたん読み</p>
          <p className="text-xs text-gray-400">本サービスはAIによる参考情報の提供であり、法的助言ではありません</p>
        </div>
      </footer>

    </div>
  )
}
