import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー — 契約書かんたん読み',
}

export default function PrivacyPage() {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">プライバシーポリシー</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 text-sm text-gray-700 leading-relaxed">

          <p>
            契約書かんたん読み（以下「本サービス」）は、ユーザーのプライバシーを尊重し、
            個人情報の保護に努めます。本プライバシーポリシーは、本サービスにおける
            情報の取扱いについて説明します。
          </p>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">1. 収集する情報</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>アカウント情報</strong>: Google認証またはメール/パスワードによるログイン時に、メールアドレスとユーザーIDを取得します。</li>
              <li><strong>アップロードファイル</strong>: 契約書のPDFまたは画像ファイルをアップロードいただきます。これらのファイルはAI解析完了後に即時削除されます。</li>
              <li><strong>解析履歴</strong>: ログインユーザーの場合、解析結果をFirestoreに保存します。</li>
              <li><strong>アクセス情報</strong>: IPアドレス（レートリミット目的のみ、保存しません）。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">2. 情報の利用目的</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>契約書の解析サービスの提供</li>
              <li>解析履歴の表示（ログインユーザーのみ）</li>
              <li>不正利用の防止（レートリミット）</li>
              <li>サービスの改善</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">3. 第三者への提供</h2>
            <p>本サービスでは以下の第三者サービスを利用しています。</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Anthropic（Claude API）</strong>: 契約書テキストをAI解析のために送信します。Anthropicのプライバシーポリシーに従い処理されます。</li>
              <li><strong>Firebase（Google）</strong>: 認証、データベース、ファイルストレージに利用します。</li>
              <li><strong>Google AdSense</strong>: 広告の配信に利用します。詳細は下記「広告配信について」をご参照ください。</li>
            </ul>
            <p className="mt-2">上記以外の第三者に個人情報を提供することはありません。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">3-2. 広告配信について（Google AdSense）</h2>
            <p>
              本サービスではGoogle AdSenseを利用して広告を配信しています。
              Google AdSenseはユーザーの興味に基づいた広告を表示するために、
              Cookie（クッキー）を使用することがあります。
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Googleは、ユーザーがアクセスしたウェブサイトの情報に基づいて広告を配信します。</li>
              <li>ユーザーはGoogleの<a href="https://www.google.com/settings/ads" className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer">広告設定ページ</a>で、パーソナライズ広告を無効にすることができます。</li>
              <li>また、<a href="https://www.aboutads.info/choices/" className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>にアクセスすることで、第三者配信事業者によるCookieの利用を無効にすることができます。</li>
              <li>Googleのプライバシーポリシーの詳細は<a href="https://policies.google.com/privacy" className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer">Google プライバシーポリシー</a>をご確認ください。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">4. データの保存と削除</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>アップロードされたファイルは解析完了後に<strong>即時削除</strong>されます。</li>
              <li>解析履歴はユーザーのアカウントに紐づけて保存され、ユーザー本人のみがアクセスできます。</li>
              <li>アカウントの削除を希望される場合は、お問い合わせください。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">5. セキュリティ</h2>
            <p>
              本サービスはHTTPS通信を使用し、Firebase セキュリティルールにより
              ユーザーデータへのアクセスを適切に制限しています。
              ただし、インターネット上での完全なセキュリティを保証するものではありません。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">6. お子様のプライバシー</h2>
            <p>
              本サービスは13歳未満のお子様を対象としていません。
              13歳未満のお子様から意図的に個人情報を収集することはありません。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">7. ポリシーの変更</h2>
            <p>
              本プライバシーポリシーは予告なく変更される場合があります。
              変更後のポリシーは本ページに掲載した時点で効力を生じます。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">8. お問い合わせ</h2>
            <p>
              プライバシーに関するお問い合わせは以下までご連絡ください。
            </p>
            <p className="mt-1 font-medium">メール: contract-reader@example.com</p>
          </section>

          <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
            制定日: 2026年3月24日
          </p>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-8">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center space-y-3">
          <nav className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <a href="/" className="hover:text-gray-700">ホーム</a>
            <a href="/about" className="hover:text-gray-700">サービスについて</a>
            <a href="/terms" className="hover:text-gray-700">利用規約</a>
            <a href="/privacy" className="hover:text-gray-700">プライバシーポリシー</a>
            <a href="/contact" className="hover:text-gray-700">お問い合わせ</a>
          </nav>
          <p className="text-xs text-gray-400">© 2025 契約書かんたん読み</p>
        </div>
      </footer>
    </div>
  )
}
