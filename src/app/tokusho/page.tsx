import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 — 契約書かんたん読み',
  description: '契約書かんたん読みの特定商取引法に基づく表記です。',
}

const rows: { label: string; value: React.ReactNode }[] = [
  { label: '販売業者', value: 'settlabs（運営者: 川北拓海）' },
  { label: '運営責任者', value: '川北拓海' },
  {
    label: '所在地',
    value: (
      <>
        〒450-0002 愛知県名古屋市中村区名駅4丁目24番5号第2森ビル401
      </>
    ),
  },
  {
    label: '電話番号',
    value: '050-6860-7271（受付時間: 平日10:00〜18:00）',
  },
  {
    label: 'メールアドレス',
    value: (
      <a href="mailto:info@settlabs.app" className="text-blue-600 hover:underline">
        info@settlabs.app
      </a>
    ),
  },
  { label: 'サービス名', value: '契約書かんたん読み' },
  { label: 'サービスURL', value: 'https://settlabs.app/contract_reader/' },
  {
    label: '販売価格',
    value: (
      <ul className="space-y-1">
        <li>無料プラン: 無料（月1回まで解析可能・1回あたり最大20枚）</li>
        <li>ライトプラン: 月額 ¥300（税込）／月3回まで解析可能・1回あたり最大20枚</li>
        <li>スタンダードプラン: 月額 ¥500（税込）／月5回まで解析可能・1回あたり最大20枚</li>
      </ul>
    ),
  },
  {
    label: '商品代金以外の必要料金',
    value: (
      <>
        <p>
          サービスのご利用にあたり、インターネット接続料金および通信料はお客様のご負担となります。
        </p>
        <p className="mt-1">
          上記販売価格は消費税込みの金額であり、当社からの追加手数料は発生いたしません。
        </p>
      </>
    ),
  },
  {
    label: '支払方法',
    value: 'クレジットカード（Visa・Mastercard・American Express・JCB）',
  },
  {
    label: '支払時期',
    value: (
      <>
        <p>初回: サブスクリプション登録時にお支払いが発生します。</p>
        <p className="mt-1">2回目以降: 毎月の登録応当日に自動的に課金されます。</p>
      </>
    ),
  },
  {
    label: 'サービス提供時期',
    value: '決済完了後、即時ご利用いただけます。',
  },
  {
    label: '契約期間・自動更新',
    value: (
      <>
        <p>
          本サブスクリプションは契約期間の定めのない自動更新契約です。
        </p>
        <p className="mt-1">
          毎月の登録応当日に自動的に契約が更新され、解約のお手続きをいただくまで料金が発生し続けます。
        </p>
      </>
    ),
  },
  {
    label: '解約方法',
    value: (
      <>
        <p>
          ログイン後、画面上部のヘッダーにある「サブスクリプション管理」ボタンをクリックしていただくと、Stripe のお客様ポータルに移動します。
        </p>
        <p className="mt-1">
          ポータル画面の「プランをキャンセル」ボタンより、いつでもオンラインで解約手続きを完了できます。電話やメールでのお手続きは不要です。
        </p>
        <p className="mt-1">
          解約後は現在の請求期間の終了日まで引き続きサービスをご利用いただけ、それ以降は自動的に無料プランへ移行します。
        </p>
      </>
    ),
  },
  {
    label: '返品・返金について',
    value: (
      <>
        <p>
          デジタルコンテンツの性質上、サービス利用開始後の返金および期間途中のご解約による日割り返金は行っておりません。
        </p>
        <p className="mt-1">
          ただし、当社の責に帰すべき事由によりサービスをご利用いただけなかった場合は、別途ご相談に応じます。
        </p>
      </>
    ),
  },
  {
    label: '動作環境',
    value: 'Chrome・Safari・Firefox・Edge の最新バージョン（PC・スマートフォン対応）',
  },
]

export default function TokushoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="font-bold text-gray-900">契約書かんたん読み</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">特定商取引法に基づく表記</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm text-gray-700">
            <tbody>
              {rows.map(({ label, value }, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <th className="text-left align-top px-5 py-4 font-semibold text-gray-900 whitespace-nowrap w-36">
                    {label}
                  </th>
                  <td className="px-5 py-4 leading-relaxed">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-6">最終更新日: 2026年5月9日</p>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <nav className="flex flex-wrap gap-4 justify-center text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900">トップページ</Link>
            <Link href="/about" className="hover:text-gray-900">サービスについて</Link>
            <Link href="/terms" className="hover:text-gray-900">利用規約</Link>
            <Link href="/privacy" className="hover:text-gray-900">プライバシーポリシー</Link>
            <Link href="/tokusho" className="hover:text-gray-900">特定商取引法</Link>
            <Link href="/contact" className="hover:text-gray-900">お問い合わせ</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
