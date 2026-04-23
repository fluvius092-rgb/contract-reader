import Link from 'next/link'
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
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="font-bold text-gray-900">契約書かんたん読み</span>
          </Link>
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
              メール: <a href="mailto:settlabs.app@gmail.com" className="text-blue-600 hover:underline">settlabs.app@gmail.com</a>
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

            <div className="space-y-6">

              {/* ── 基本 ── */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">基本的な使い方</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900">Q: 無料で使えますか？</h4>
                    <p className="mt-1">
                      A: 1日1回まで無料でご利用いただけます（アカウント登録後は月3回まで無料）。
                      アカウント登録をしなくてもすぐにお使いいただけます。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900">Q: 対応している契約書の種類は？</h4>
                    <p className="mt-1">
                      A: 不動産賃貸契約書、携帯電話契約書、保険契約書、ローン契約書、雇用契約書に対応しています。
                      「その他」カテゴリを選択することで、上記以外の一般的な契約書も解析可能です。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900">Q: 対応しているファイル形式は？</h4>
                    <p className="mt-1">
                      A: PDF・JPEG・PNG・WebP・HEICに対応しています。スマートフォンで撮影した写真もそのままアップロード可能です。
                      1回あたり最大20枚（プランにより異なる）まで同時にアップロードできます。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900">Q: アップロードした契約書はどうなりますか？</h4>
                    <p className="mt-1">
                      A: アップロードされたファイルは、AI解析が完了した直後にサーバーから完全に削除されます。
                      第三者への提供やAI学習への使用は一切行いません。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900">Q: AIの解析結果は正確ですか？</h4>
                    <p className="mt-1">
                      A: AIによる参考情報としてご利用ください。法的助言や専門家の意見に代わるものではありません。
                      重要な判断をされる際は、弁護士等の専門家にご相談ください。
                    </p>
                  </div>
                </div>
              </div>

              {/* ── 課金・プラン ── */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">課金・プランについて</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900">Q: プランの種類を教えてください</h4>
                    <p className="mt-1">
                      A: 以下の3プランをご用意しています。
                    </p>
                    <ul className="mt-2 space-y-1 pl-4">
                      <li>・<strong>都度課金（¥500）</strong>: 1回だけ使いたい方向け。最大60枚まで対応。有効期限なし。</li>
                      <li>・<strong>ライトプラン（¥300/月）</strong>: 月3回まで解析可能。最大20枚/回。</li>
                      <li>・<strong>スタンダードプラン（¥500/月）</strong>: 月5回まで解析可能。最大20枚/回。</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900">Q: 都度課金チケットの有効期限はありますか？</h4>
                    <p className="mt-1">
                      A: 有効期限はありません。購入後、好きなタイミングでご利用いただけます。
                      複数枚購入した場合も、残ったチケットはそのまま繰り越されます。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900">Q: チケットを持っている状態でさらに購入できますか？</h4>
                    <p className="mt-1">
                      A: 可能です。ただし、購入時に「チケットが残っています」という確認画面が表示されます。
                      内容をご確認の上、追加購入を行ってください。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900">Q: サブスクリプションはいつでも解約できますか？</h4>
                    <p className="mt-1">
                      A: はい、いつでも解約できます。解約後も、支払い済みの期間末日までサービスをご利用いただけます。
                      解約はヘッダーの「サブスクリプション管理」から手続きできます。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900">Q: 支払い方法は何が使えますか？</h4>
                    <p className="mt-1">
                      A: Stripeを通じて、クレジットカード（Visa・Mastercard・American Express・JCBなど）でお支払いいただけます。
                      決済情報はStripeが管理し、当サービスでカード番号を保持することはありません。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900">Q: 返金はできますか？</h4>
                    <p className="mt-1">
                      A: 原則として返金には対応しておりません。
                      ただし、システム障害など当サービス起因の問題が発生した場合は、
                      <a href="mailto:settlabs.app@gmail.com" className="text-blue-600 hover:underline">settlabs.app@gmail.com</a> までご連絡ください。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900">Q: 月の途中でプランを変更した場合は？</h4>
                    <p className="mt-1">
                      A: サブスクリプションの変更はStripeの管理画面から行えます。
                      詳細な日割り計算等はStripeの規定に従います。
                      変更・解約はヘッダーの「サブスクリプション管理」からご確認ください。
                    </p>
                  </div>
                </div>
              </div>

              {/* ── アカウント ── */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">アカウントについて</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900">Q: アカウント登録は必要ですか？</h4>
                    <p className="mt-1">
                      A: 登録なしでも利用できますが、課金プランの利用・解析履歴の保存にはアカウントが必要です。
                      Googleアカウントまたはメールアドレスとパスワードで登録できます。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900">Q: アカウントを削除したいのですが？</h4>
                    <p className="mt-1">
                      A: <Link href="/account-delete" className="text-blue-600 hover:underline">アカウント削除ページ</Link>からお手続きいただけます。
                      削除すると解析履歴もすべて消去されます。この操作は取り消しできません。
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <nav className="flex flex-wrap gap-4 justify-center text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900">トップページ</Link>
            <Link href="/about" className="hover:text-gray-900">サービスについて</Link>
            <Link href="/terms" className="hover:text-gray-900">利用規約</Link>
            <Link href="/privacy" className="hover:text-gray-900">プライバシーポリシー</Link>
            <Link href="/contact" className="hover:text-gray-900">お問い合わせ</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
