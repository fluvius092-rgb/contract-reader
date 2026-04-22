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
const KEY_NUMBER_LABELS: Record<string, string> = {
  rent: '家賃', deposit: '敷金/礼金', contract_period: '契約期間',
  notice_period: '解約予告', renewal_fee: '更新料',
  total_price: '引越し料金', work_date: '作業日時',
  cancel_fee: 'キャンセル料', liability_limit: '損害賠償上限',
  payment_timing: '支払い方法',
  monthly_fee_now: '現在の月額', discount_end: '割引終了',
  cancellation_fee: '解約違約金', data_limit: 'データ容量',
  device_remaining: '端末残債',
  monthly_premium: '月額保険料', max_coverage: '最大保障額',
  waiting_period: '待機期間', surrender_value: '解約返戻金',
  apr: '実質年率', monthly_payment: '毎月の返済', total_repayment: '総返済額',
  late_penalty_rate: '遅延損害金',
  salary: '給与', trial_period: '試用期間', overtime: '残業',
}

function KeyNumbers({ numbers }: { numbers: Record<string, string> }) {
  const entries = Object.entries(numbers as unknown as Record<string, string>)

  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="grid items-start px-3 py-2.5 border-b border-gray-100 last:border-0 text-sm gap-x-3"
          style={{ gridTemplateColumns: '6rem 1fr' }}
        >
          <span className="text-gray-500 leading-snug">{KEY_NUMBER_LABELS[key] ?? key}</span>
          <span className="font-medium text-gray-900 leading-snug">{value}</span>
        </div>
      ))}
    </div>
  )
}

// ── ダウンロード用テキスト生成 ────────────────────────
const KEY_LABELS: Record<string, string> = {
  ...KEY_NUMBER_LABELS,
  purpose: '契約の目的', period: '契約期間', amount: '金額・費用', cancellation: '解除・解約',
}

const LEVEL_LABELS: Record<string, string> = { high: '要確認', medium: '確認', low: '参考' }

function buildDownloadText(result: AnalysisResult, categoryLabel: string): string {
  const lines: string[] = []
  const hr = '─'.repeat(40)

  lines.push(`契約書かんたん読み — 解析結果`)
  lines.push(`作成日時: ${new Date().toLocaleString('ja-JP')}`)
  lines.push(hr)
  lines.push(`書類種別: ${result.doc_type}`)
  lines.push(`カテゴリ: ${categoryLabel}`)
  if (result.confidence) {
    const label = { high: '高', medium: '中', low: '低' }[result.confidence]
    lines.push(`読取精度: ${label}`)
  }
  lines.push('')

  lines.push('【重要な数字・日付】')
  for (const [key, value] of Object.entries(result.key_numbers as unknown as Record<string, string>)) {
    lines.push(`  ${(KEY_LABELS[key] ?? key).padEnd(10)}  ${value}`)
  }
  lines.push('')

  lines.push('【要点まとめ】')
  result.summary.forEach(item => lines.push(`  • ${item}`))
  lines.push('')

  if (result.warnings.length > 0) {
    lines.push('【注意すべき条項】')
    const sorted = [...result.warnings].sort((a, b) =>
      ({ high: 0, medium: 1, low: 2 }[a.level] - { high: 0, medium: 1, low: 2 }[b.level]),
    )
    sorted.forEach(w => {
      lines.push(`  [${LEVEL_LABELS[w.level]}] ${w.title}`)
      lines.push(`        ${w.detail}`)
    })
    lines.push('')
  }

  if (result.coverage) {
    lines.push('【保障されない事象（免責事項）】')
    result.coverage.not_covered.forEach(item => lines.push(`  ✕ ${item}`))
    lines.push('')
    lines.push('【保障される事象】')
    result.coverage.covered.forEach(item => lines.push(`  ✓ ${item}`))
    lines.push('')
  }

  if (result.cancel_guide) {
    lines.push('【解約手順】')
    if (result.cancel_guide.free_cancel_window !== '記載なし') {
      lines.push(`  解約金不要の月: ${result.cancel_guide.free_cancel_window}`)
    }
    result.cancel_guide.steps.forEach((step, i) => lines.push(`  ${i + 1}. ${step}`))
    lines.push('')
  }

  if (result.moving_checklist && result.moving_checklist.length > 0) {
    lines.push('【引越し当日・前後チェックリスト】')
    result.moving_checklist.forEach(item => lines.push(`  □ ${item}`))
    lines.push('')
  }

  if (result.tenant_checklist && result.tenant_checklist.length > 0) {
    lines.push('【入居前・退去前チェックリスト】')
    result.tenant_checklist.forEach(item => lines.push(`  □ ${item}`))
    lines.push('')
  }

  if (result.terms.length > 0) {
    lines.push('【難しい用語の解説】')
    result.terms.forEach(t => lines.push(`  ${t.word}: ${t.plain}`))
    lines.push('')
  }

  lines.push(hr)
  lines.push('【重要】必ず原文を自分で確認してください')
  lines.push('この解析結果はAIによる参考情報であり、誤りや読み落としが含まれる場合があります。')
  lines.push('契約書への署名・捺印の前に、必ず原文全体をご自身でお読みください。')
  lines.push('重要な判断については弁護士・司法書士等の専門家にご相談ください。')

  return lines.join('\n')
}

function downloadAsText(result: AnalysisResult, categoryLabel: string) {
  const text = buildDownloadText(result, categoryLabel)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `契約書解析_${result.doc_type}_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// ── PDF 用 HTML 生成 ────────────────────────────────────
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildPrintHtml(result: AnalysisResult, categoryLabel: string): string {
  const date = new Date().toLocaleString('ja-JP')
  const levelColor  = { high: '#dc2626', medium: '#d97706', low: '#6b7280' }
  const levelBg     = { high: '#fef2f2', medium: '#fffbeb', low: '#f9fafb' }
  const levelLabel  = { high: '要確認',  medium: '確認',    low: '参考'   }
  const confLabel   = { high: '読取精度：高', medium: '読取精度：中', low: '読取精度：低' }
  const confColor   = { high: '#166534',      medium: '#92400e',      low: '#991b1b'      }
  const confBg      = { high: '#f0fdf4',      medium: '#fffbeb',      low: '#fef2f2'      }
  const confBorder  = { high: '#bbf7d0',      medium: '#fde68a',      low: '#fecaca'      }
  const confHtml = result.confidence
    ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:2px 10px;border-radius:999px;border:1px solid ${confBorder[result.confidence]};background:${confBg[result.confidence]};color:${confColor[result.confidence]};margin-left:8px">${confLabel[result.confidence]}</span>`
    : ''

  const keyRows = Object.entries(result.key_numbers as unknown as Record<string, string>)
    .map(([k, v]) => `<div class="kr"><span class="kl">${esc(KEY_LABELS[k] ?? k)}</span><span class="kv">${esc(v)}</span></div>`)
    .join('')

  const summaryHtml = result.summary
    .map(s => `<li>${esc(s)}</li>`).join('')

  const warningsHtml = result.warnings.length === 0 ? '' : `
    <section>
      <h2>注意すべき条項</h2>
      ${[...result.warnings]
        .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.level] - { high: 0, medium: 1, low: 2 }[b.level]))
        .map(w => `
          <div class="warning" style="border-left-color:${levelColor[w.level]};background:${levelBg[w.level]}">
            <div class="wh"><span class="badge" style="background:${levelColor[w.level]}">${levelLabel[w.level]}</span><strong>${esc(w.title)}</strong></div>
            <p>${esc(w.detail)}</p>
          </div>`).join('')}
    </section>`

  const coverageHtml = !result.coverage ? '' : `
    <section>
      <h2>⚠️ 保障されない事象（免責事項）</h2>
      <ul class="nc">${result.coverage.not_covered.map(s => `<li>✕ ${esc(s)}</li>`).join('')}</ul>
      <h2 style="margin-top:12px">保障される事象</h2>
      <ul class="cv">${result.coverage.covered.map(s => `<li>✓ ${esc(s)}</li>`).join('')}</ul>
    </section>`

  const cancelHtml = !result.cancel_guide ? '' : `
    <section>
      <h2>解約手順</h2>
      ${result.cancel_guide.free_cancel_window !== '記載なし' ? `<p class="hl">解約金不要の月: ${esc(result.cancel_guide.free_cancel_window)}</p>` : ''}
      <ol>${result.cancel_guide.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    </section>`

  const movingChecklistHtml = (!result.moving_checklist || result.moving_checklist.length === 0) ? '' : `
    <section>
      <h2>引越し当日・前後チェックリスト</h2>
      <ul class="cv">${result.moving_checklist.map(s => `<li>□ ${esc(s)}</li>`).join('')}</ul>
    </section>`

  const checklistHtml = (!result.tenant_checklist || result.tenant_checklist.length === 0) ? '' : `
    <section>
      <h2>入居前・退去前チェックリスト</h2>
      <ul class="cv">${result.tenant_checklist.map(s => `<li>□ ${esc(s)}</li>`).join('')}</ul>
    </section>`

  const termsHtml = result.terms.length === 0 ? '' : `
    <section>
      <h2>難しい用語の解説</h2>
      <div class="terms">${result.terms.map(t => `
        <div class="tr"><span class="tw">${esc(t.word)}</span><span class="tp">${esc(t.plain)}</span></div>`).join('')}
      </div>
    </section>`

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>契約書解析 - ${esc(result.doc_type)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans','Noto Sans JP',Meiryo,sans-serif;font-size:14px;line-height:1.75;color:#1f2937;padding:28px;max-width:780px;margin:0 auto}
.pbtn{display:block;margin:0 auto 24px;padding:10px 36px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer}
.pbtn:hover{background:#4338ca}
.hdr{border-bottom:2px solid #e5e7eb;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.badge-cat{display:inline-block;font-size:11px;padding:2px 10px;border-radius:999px;background:#e0e7ff;color:#4338ca;font-weight:600;margin-bottom:4px}
.doc-type{font-size:20px;font-weight:700}
.meta{font-size:11px;color:#6b7280;text-align:right;flex-shrink:0}
section{margin-bottom:22px}
h2{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af;margin-bottom:8px}
.kns{background:#f9fafb;border-radius:10px;overflow:hidden}
.kr{display:grid;grid-template-columns:6.5rem 1fr;gap:8px;padding:9px 14px;border-bottom:1px solid #f3f4f6;font-size:13px}
.kr:last-child{border-bottom:none}
.kl{color:#6b7280}
.kv{font-weight:600;word-break:break-all}
ul.sum{list-style:none}
ul.sum li{padding:3px 0 3px 16px;position:relative;font-size:13px}
ul.sum li::before{content:'•';position:absolute;left:0;color:#6366f1}
.warning{border-left:4px solid;border-radius:0 8px 8px 0;padding:10px 14px;margin-bottom:8px}
.wh{display:flex;align-items:baseline;gap:8px;margin-bottom:4px}
.badge{font-size:11px;padding:1px 7px;border-radius:4px;color:#fff;font-weight:600;flex-shrink:0}
.warning strong{font-size:13px}
.warning p{font-size:12px;color:#4b5563;margin-top:4px}
ul.nc{list-style:none;background:#fef2f2;border-radius:8px;padding:10px 14px}
ul.nc li{color:#dc2626;font-size:13px;padding:2px 0}
ul.cv{list-style:none;background:#f0fdf4;border-radius:8px;padding:10px 14px}
ul.cv li{color:#166534;font-size:13px;padding:2px 0}
.hl{background:#eff6ff;border-radius:6px;padding:8px 12px;font-size:13px;font-weight:600;color:#1e40af;margin-bottom:10px}
ol{padding-left:20px}
ol li{font-size:13px;padding:2px 0}
.terms{border:1px solid #e5e7eb;border-radius:8px;overflow:hidden}
.tr{display:grid;grid-template-columns:8rem 1fr;gap:8px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px}
.tr:last-child{border-bottom:none}
.tw{font-weight:600;color:#4338ca}
.tp{color:#4b5563}
.disc{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;font-size:12px;color:#78350f;line-height:1.6}
@media print{@page{margin:15mm 12mm}body{padding:0}.pbtn{display:none}section{page-break-inside:avoid}}
</style>
</head>
<body>
<button class="pbtn" onclick="window.print()">🖨️ PDFとして保存</button>
<div class="hdr">
  <div><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px"><span class="badge-cat">${esc(categoryLabel)}</span>${confHtml}</div><div class="doc-type">${esc(result.doc_type)}</div></div>
  <div class="meta"><div>契約書かんたん読み</div><div>${date}</div></div>
</div>
<section><h2>重要な数字・日付</h2><div class="kns">${keyRows}</div></section>
<section><h2>要点まとめ</h2><ul class="sum">${summaryHtml}</ul></section>
${warningsHtml}${coverageHtml}${cancelHtml}${movingChecklistHtml}${checklistHtml}${termsHtml}
<div class="disc"><strong style="color:#92400e;display:block;margin-bottom:4px">必ず原文を自分で確認してください</strong>この解析結果はAIによる参考情報であり、誤りや読み落としが含まれる場合があります。契約書への署名・捺印の前に、必ず原文全体をご自身でお読みください。重要な判断については弁護士・司法書士等の専門家にご相談ください。</div>
</body>
</html>`
}

function openAsPdf(result: AnalysisResult, categoryLabel: string) {
  const html = buildPrintHtml(result, categoryLabel)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.target   = '_blank'
  a.rel      = 'noopener'
  a.click()
  // blob URL はタブが閉じられると自動解放されるため revoke 不要
}

// ── 解析精度バッジ ────────────────────────────────────
const CONFIDENCE_STYLES = {
  high:   { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200', icon: '●', label: '読取精度：高' },
  medium: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200', icon: '◑', label: '読取精度：中' },
  low:    { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',   icon: '○', label: '読取精度：低' },
}

// ── メインコンポーネント ───────────────────────────────
interface Props {
  result: AnalysisResult
  onReset: () => void
}

export function AnalysisResultView({ result, onReset }: Props) {
  const category = CATEGORIES.find(c => c.id === result.category)
  const conf = result.confidence ? CONFIDENCE_STYLES[result.confidence] : null

  return (
    <div className="space-y-6">

      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: category ? `${category.color}20` : '#f3f4f6',
                color: category?.color ?? '#374151',
              }}
            >
              {category?.emoji} {category?.label}
            </div>
            {conf && (
              <span className={clsx('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border', conf.bg, conf.text, conf.border)}>
                <span>{conf.icon}</span>
                {conf.label}
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{result.doc_type}</h2>
          {result.confidence === 'low' && (
            <p className="text-xs text-red-600 mt-1">
              画像の鮮明さや傾きにより読み取り精度が低下している可能性があります。より鮮明な画像で再試行するとより正確な結果が得られます。
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={onReset}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            別の書面を読む
          </button>
          <button
            onClick={() => openAsPdf(result, category?.label ?? result.category)}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 rounded-lg px-2.5 py-1 transition-colors"
          >
            <span>🖨️</span> PDFで保存
          </button>
          <button
            onClick={() => downloadAsText(result, category?.label ?? result.category)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 rounded-lg px-2.5 py-1 transition-colors"
          >
            <span>↓</span> テキストで保存
          </button>
        </div>
      </div>

      {/* 数字の一覧（最優先表示） */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          重要な数字・日付
        </h3>
        <KeyNumbers numbers={result.key_numbers} />
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

      {/* 引越し: チェックリスト */}
      {result.moving_checklist && result.moving_checklist.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            引越し当日・前後チェックリスト
          </h3>
          <ul className="bg-orange-50 rounded-xl px-3 py-2 space-y-1.5">
            {result.moving_checklist.map((item, i) => (
              <li key={i} className="text-sm text-orange-800 flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">□</span>
                {item}
              </li>
            ))}
          </ul>
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
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 space-y-1.5">
        <p className="text-sm font-semibold text-amber-800">
          必ず原文を自分で確認してください
        </p>
        <p className="text-xs text-amber-700 leading-relaxed">
          この解析結果はAIによる参考情報であり、誤りや読み落としが含まれる場合があります。契約書への署名・捺印の前に、必ず原文全体をご自身でお読みください。
        </p>
        <p className="text-xs text-amber-600">
          重要な判断については弁護士・司法書士等の専門家にご相談ください。
        </p>
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
