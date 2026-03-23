// src/components/features/AnalysisResult.tsx
'use client'

import clsx from 'clsx'
import { CATEGORIES } from '@/types'
import type { AnalysisResult, Warning, WarningLevel } from '@/types'
import { AdBanner } from '@/components/ui/AdBanner'

// ── 警告レベルのスタイル定義 ────────────────────────────
const WARNING_STYLES: Record<WarningLevel, { bg: string; border: string; badge: string; label: string }> = {
  high:   { bg: 'bg-red-50',    border: 'border-l-red-500',    badge: 'bg-red-500 text-white',   label: '要確認' },
  medium: { bg: 'bg-amber-50',  border: 'border-l-amber-400',  badge: 'bg-amber-400 text-white', label: '確認'   },
  low:    { bg: 'bg-gray-50',   border: 'border-l-gray-400',   badge: 'bg-gray-400 text-white',  label: '参考'   },
}

// ── 警告アイテム ──────────────────────────────────────
function WarningItem({ warning }: { warning: Warning }) {
  const s = WARNING_STYLES[warning.level]
  return (
    <div className={clsx('border-l-4 rounded-r-lg px-3 py-2.5 mb-2', s.bg, s.border)}>
      <div className="flex items-baseline gap-2">
        <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0', s.badge)}>
          {s.label}
        </span>
        <span className="text-sm font-semibold text-gray-800">{warning.title}</span>
      </div>
      <p className="text-sm text-gray-600 mt-0.5 ml-[46px] leading-relaxed">{warning.detail}</p>
    </div>
  )
}

// ── キーナンバー表示 ──────────────────────────────────
function KeyNumbers({ numbers }: { numbers: Record<string, string> }) {
  const labels: Record<string, string> = {
    // 不動産
    rent: '家賃', deposit: '敷金/礼金', contract_period: '契約期間',
    notice_period: '解約予告', renewal_fee: '更新料',
    // 携帯
    monthly_fee_now: '現在の月額', discount_end: '割引終了',
    cancellation_fee: '解約違約金', data_limit: 'データ容量',
    device_remaining: '端末残債',
    // 保険
    monthly_premium: '月額保険料', max_coverage: '最大保障額',
    waiting_period: '待機期間', surrender_value: '解約返戻金',
    // ローン
    apr: '実質年率', monthly_payment: '毎月の返済', total_repayment: '総返済額',
    late_penalty_rate: '遅延損害金',
    // 雇用
    salary: '給与', trial_period: '試用期間',
    overtime: '残業', // notice_period は不動産と共通
  }

  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden">
      {Object.entries(numbers).map(([key, value]) => (
        <div
          key={key}
          className="flex items-baseline justify-between px-3 py-2 border-b border-gray-100 last:border-0 text-sm"
        >
          <span className="text-gray-500 flex-shrink-0 mr-4">{labels[key] ?? key}</span>
          <span className="font-medium text-gray-900 text-right">{value}</span>
        </div>
      ))}
    </div>
  )
}

// ── メインコンポーネント ───────────────────────────────
interface Props {
  result: AnalysisResult
  onReset: () => void
}

export function AnalysisResultView({ result, onReset }: Props) {
  const category = CATEGORIES.find(c => c.id === result.category)

  return (
    <div className="space-y-6">

      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <div
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-1"
            style={{
              backgroundColor: category ? `${category.color}20` : '#f3f4f6',
              color: category?.color ?? '#374151',
            }}
          >
            {category?.emoji} {category?.label}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{result.doc_type}</h2>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-gray-400 hover:text-gray-600 underline"
        >
          別の書面を読む
        </button>
      </div>

      {/* 数字の一覧（最優先表示） */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          重要な数字・日付
        </h3>
        <KeyNumbers numbers={result.key_numbers as unknown as Record<string, string>} />
      </section>

      {/* 要点まとめ */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          要点まとめ
        </h3>
        <ul className="space-y-1.5">
          {result.summary.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
              <span
                className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: category?.color ?? '#6b7280', marginTop: '6px' }}
              />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* 保険: 保障対象外（最優先） */}
      {result.coverage && (
        <section>
          <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">
            ⚠️ 保障されない事象（免責事項）
          </h3>
          <ul className="bg-red-50 rounded-xl px-3 py-2 space-y-1.5">
            {result.coverage.not_covered.map((item, i) => (
              <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                <span className="flex-shrink-0 mt-1">✕</span>
                {item}
              </li>
            ))}
          </ul>
          <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2 mt-4">
            保障される事象
          </h3>
          <ul className="bg-green-50 rounded-xl px-3 py-2 space-y-1.5">
            {result.coverage.covered.map((item, i) => (
              <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                <span className="flex-shrink-0 mt-1">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 注意すべき条項 */}
      {result.warnings.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            注意すべき条項
          </h3>
          {/* high → medium → low の順でソート */}
          {[...result.warnings]
            .sort((a, b) => {
              const order = { high: 0, medium: 1, low: 2 }
              return order[a.level] - order[b.level]
            })
            .map((w, i) => (
              <WarningItem key={i} warning={w} />
            ))}
        </section>
      )}

      {/* 携帯: 解約ガイド */}
      {result.cancel_guide && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            解約手順
          </h3>
          <div className="bg-blue-50 rounded-xl px-3 py-3">
            {result.cancel_guide.free_cancel_window !== '記載なし' && (
              <p className="text-sm font-medium text-blue-800 mb-2">
                解約金不要の月: {result.cancel_guide.free_cancel_window}
              </p>
            )}
            <ul className="space-y-1">
              {result.cancel_guide.steps.map((step, i) => (
                <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                  <span className="flex-shrink-0 font-mono text-xs text-blue-400 mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 不動産: 入居前チェックリスト */}
      {result.tenant_checklist && result.tenant_checklist.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            入居前・退去前チェックリスト
          </h3>
          <ul className="bg-green-50 rounded-xl px-3 py-2 space-y-1.5">
            {result.tenant_checklist.map((item, i) => (
              <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">□</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 用語解説 */}
      {result.terms.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            難しい用語の解説
          </h3>
          <div className="divide-y divide-gray-100 rounded-xl overflow-hidden border border-gray-100">
            {result.terms.map((term, i) => (
              <div key={i} className="flex items-baseline gap-3 px-3 py-2.5 bg-white text-sm">
                <span
                  className="font-semibold flex-shrink-0 min-w-[100px]"
                  style={{ color: category?.color ?? '#374151' }}
                >
                  {term.word}
                </span>
                <span className="text-gray-600">{term.plain}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 免責表示（常に最下部） */}
      <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-xs text-gray-400 leading-relaxed">
        ⚠️ この内容はAIによる参考情報です。法的助言ではありません。契約内容の詳細や判断については、弁護士・司法書士等の専門家にご相談ください。
      </div>

      {/* 広告 */}
      <AdBanner
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULT ?? ''}
        format="auto"
        className="mt-2"
      />
    </div>
  )
}
