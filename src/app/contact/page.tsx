import type { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'お問い合わせ — 契約書かんたん読み',
  description: '契約書かんたん読みへのお問い合わせ・ご意見はこちらから。',
}

export default function ContactPage() {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">お問い合わせ</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">お問い合わせ先</h2>
            <p>
              「契約書かんたん読み」に関するお問い合わせは、以下のメールアドレスまでご連絡ください。
            </p>
            <p className="mt-2 font-medium">
              メール: <a href="mailto:contract-reader@example.com" className="text-blue-600 hover:underline">contract-reader@example.com</a>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              ※ 回答までに3営業日程度お時間をいただく場合がございます。あらかじめご了承ください。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">お問い合わせの種類</h2>
            <p>以下のようなお問い合わせを受け付けております。</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>サービスに関するご質問</li>
              <li>不具合のご報告</li>
              <li>アカウント削除のご依頼</li>
              <li>その他のご意見・ご要望</li>
            </ul>
            <p className="mt-2">
              お問い合わせの際は、お名前（ニックネーム可）、お問い合わせの種類、具体的な内容をご記載いただけますと、
              よりスムーズにご対応させていただけます。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">よくある質問（FAQ）</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900">Q: 無料で使えますか？</h3>
                <p className="mt-1">
                  A: はい、無料でご利用いただけます。アカウント登録をしなくてもすぐにお使いいただけます。
                  基本的な契約書の解析機能はすべて無料で提供しております。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900">Q: 対応している契約書の種類は？</h3>
                <p className="mt-1">
                  A: 現在、不動産賃貸契約書、携帯電話契約書、生命保険・医療保険契約書、住宅ローン契約書、
                  雇用契約書・労働条件通知書に対応しています。これら以外の一般的な契約書も解析可能な場合があります。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900">Q: アップロードした契約書はどうなりますか？</h3>
                <p className="mt-1">
                  A: アップロードされた契約書ファイルは、AIによる解析が完了した直後にサーバーから完全に削除されます。
                  お客様の契約書データが不必要に保存されることはありませんので、安心してご利用ください。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900">Q: アカウント登録は必要ですか？</h3>
                <p className="mt-1">
                  A: アカウント登録をしなくても契約書の解析機能をご利用いただけます。
                  ただし、過去の解析履歴を保存して後から確認したい場合は、アカウント登録が必要です。
                  Googleアカウントまたはメールアドレスで簡単に登録できます。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900">Q: AIの解析結果は正確ですか？</h3>
                <p className="mt-1">
                  A: AIの解析結果はあくまで参考情報としてご利用ください。法的助言や専門家の意見に代わるものではありません。
                  契約の締結や解約など重要な判断を行う際は、必ず弁護士等の専門家にご相談ください。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900">Q: スマートフォンで使えますか？</h3>
                <p className="mt-1">
                  A: はい、スマートフォンに対応しています。iPhone、Androidのどちらからでもブラウザで
                  アクセスしてご利用いただけます。アプリのインストールは不要です。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900">Q: 対応しているファイル形式は？</h3>
                <p className="mt-1">
                  A: PDF形式および画像形式（JPG、PNG）に対応しています。
                  契約書をスマートフォンのカメラで撮影した写真もアップロード可能です。
                  なるべく文字がはっきり読める状態で撮影してください。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900">Q: 解析にかかる時間はどのくらいですか？</h3>
                <p className="mt-1">
                  A: 通常、数秒から1分程度で解析が完了します。契約書のページ数や内容の複雑さにより、
                  多少前後する場合がございます。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900">Q: アカウントを削除したいのですが？</h3>
                <p className="mt-1">
                  A: アカウントの削除は<a href="/delete-account" className="text-blue-600 hover:underline">アカウント削除ページ</a>から
                  お手続きいただけます。アカウントを削除すると、保存されている解析履歴もすべて削除されます。
                  この操作は取り消すことができませんのでご注意ください。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900">Q: 英語の契約書に対応していますか？</h3>
                <p className="mt-1">
                  A: 現在は日本語の契約書のみに対応しております。英語およびその他の言語の契約書への対応は、
                  今後のアップデートで検討しております。
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <nav className="flex flex-wrap gap-4 justify-center text-sm text-gray-500">
            <a href="/" className="hover:text-gray-900">トップページ</a>
            <a href="/about" className="hover:text-gray-900">サービスについて</a>
            <a href="/terms" className="hover:text-gray-900">利用規約</a>
            <a href="/privacy" className="hover:text-gray-900">プライバシーポリシー</a>
            <a href="/contact" className="hover:text-gray-900">お問い合わせ</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
