import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'アカウント削除 — 契約書かんたん読み',
}

export default function AccountDeletePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="font-bold text-gray-900">契約書かんたん読み</span>
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">アカウントとデータの削除</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">アカウント削除の手順</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>以下のメールアドレス宛に、アカウント削除リクエストを送信してください。</li>
              <li>メールの件名に「アカウント削除リクエスト」と記載してください。</li>
              <li>本文にログインに使用しているメールアドレスを記載してください。</li>
              <li>リクエスト受領後、<strong>30日以内</strong>にアカウントと関連データを削除します。</li>
              <li>削除完了後、確認のメールをお送りします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">削除されるデータ</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>アカウント情報</strong>: メールアドレス、ユーザーID</li>
              <li><strong>解析履歴</strong>: 過去の契約書解析結果すべて</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">アップロードファイルについて</h2>
            <p>
              契約書のPDFや画像ファイルは、解析完了後に<strong>即時削除</strong>されています。
              アカウント削除時点でサーバーにファイルは残っていません。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">データのみの削除</h2>
            <p>
              アカウントを維持したまま、解析履歴のみを削除することも可能です。
              その場合は、メールの件名を「データ削除リクエスト」としてお送りください。
            </p>
          </section>

          <section className="bg-gray-50 rounded-xl p-4">
            <h2 className="text-base font-bold text-gray-900 mb-2">お問い合わせ先</h2>
            <p className="font-medium">メール: contract-reader@example.com</p>
            <p className="text-xs text-gray-400 mt-1">通常3営業日以内に返信いたします。</p>
          </section>

        </div>
      </main>
    </div>
  )
}
