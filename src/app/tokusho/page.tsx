import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 — 契約書かんたん読み',
  description: '契約書かんたん読みの特定商取引法に基づく表記です。',
}

const rows: { label: string; value: React.ReactNode }[] = [
  { label: '販売業者', value: '川北 拓実' },
  { label: '運営責任者', value: '川北 拓実' },
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
    value: (
      <>
        請求があり次第、遅滞なく開示します
        <br />
        <span className="text-gray-400 text-xs">お問い合わせはメールにてお願いいたします</span>
      </>
    ),
  },
  {
    label: 'メールアドレス',
    value: (
      <a href="mailto:settlabs.app@gmail.com" className="text-blue-600 hover:underline">
        settlabs.app@gmail.com
      </a>
    ),
  },
  { label: 'サービス名', value: '契約書かんたん読み' },
  { label: 'サービスURL', value: 'https://settlabs.app/contract_reader/' },
  {
    label: '販売価格',
    value: (
      <ul className="space-y-1">
        <li>無料プラン: 無料（月3回まで解析可能）</li>
        <li>スタンダードプラン: 月額 ¥500（税込）／月30回まで解析可能</li>
        <li>プレミアムプラン: 月額 ¥1,000（税込）／月100回まで解析可能</li>
      </ul>
    ),
  },
  {
    label: '支払方法',
    value: 'クレジットカード（Visa・Mastercard・American Express・JCB）',
  },
  {
    label: '支払時期',
    value: 'サブスクリプション登録時に課金が発生し、以降は毎月同日に自動更新されます。',
  },
  {
    label: 'サービス提供時期',
    value: '決済完了後、即時ご利用いただけます。',
  },
  {
    label: '返品・キャンセルについて',
    value: (
      <>
        <p>サブスクリプションはいつでもキャンセル可能です。</p>
        <p className="mt-1">
          キャンセル後は現在の請求期間の終了日までサービスをご利用いただけます。
          期間途中のご解約による返金は行っておりません。
        </p>
        <p className="mt-1">
          なお、デジタルコンテンツの性質上、サービス利用開始後の返金はいたしかねます。
          あらかじめご了承ください。
        </p>
      </>
    ),
  },
  {
    label: '動作環境',
    value: 'Chrome・Safari・Firefox・Edgeの最新バージョン（PC・スマートフォン対応）',
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

        <p className="text-xs text-gray-400 mt-6">最終更新日: 2026年4月23日</p>
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
