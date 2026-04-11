import type { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: '契約書かんたん読みについて — 契約書かんたん読み',
  description: 'AIが契約書をわかりやすく解説するサービス「契約書かんたん読み」のサービス紹介ページです。',
}

export default function AboutPage() {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">契約書かんたん読みについて</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">サービス概要</h2>
            <p>
              「契約書かんたん読み」は、AI（人工知能）を活用して、難しい契約書の内容をわかりやすく整理・解説するWebサービスです。
              不動産の賃貸契約書、携帯電話の契約書、保険の契約書、住宅ローンの契約書、雇用契約書など、
              日常生活で目にするさまざまな契約書に対応しています。
            </p>
            <p className="mt-2">
              契約書には法律用語や専門用語が多く含まれており、一般の方にとって内容を正確に理解することは容易ではありません。
              本サービスでは、最新のAI技術を活用して契約書の内容を解析し、
              重要なポイントや注意すべき条項をわかりやすい言葉でお伝えします。
              契約書を読む時間がない方や、専門用語に不安を感じている方に、安心して契約内容を確認いただけるよう設計されています。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">こんな方におすすめ</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>初めて賃貸契約をする方で、契約書の内容が難しくて不安な方</li>
              <li>携帯電話やインターネット回線の契約書が複雑で、何が書いてあるかわからない方</li>
              <li>生命保険や医療保険の契約内容を正しく理解したい方</li>
              <li>住宅ローンの契約書に記載されている注意点や条件を把握したい方</li>
              <li>転職や新しい仕事を始める際に、雇用契約書や労働条件通知書の内容を確認したい方</li>
              <li>契約更新の前に、現在の契約内容をあらためて確認しておきたい方</li>
              <li>ご家族やご友人の代わりに契約内容を確認してあげたい方</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">特徴</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>AIによる即時解析</strong>: 契約書をアップロードするだけで、数秒から1分程度で解析結果が表示されます。
                長い契約書を自分で読む時間を大幅に短縮できます。
              </li>
              <li>
                <strong>専門用語をわかりやすく翻訳</strong>: 法律用語や業界特有の専門用語を、日常的な言葉に置き換えて説明します。
                「瑕疵担保責任」「善管注意義務」「期限の利益の喪失」など、難しい言葉もわかりやすくお伝えします。
              </li>
              <li>
                <strong>注意すべきポイントをハイライト</strong>: 解約条件、違約金、自動更新条項など、
                特に注意が必要な箇所をわかりやすく強調して表示します。見落としがちな重要事項を確認できます。
              </li>
              <li>
                <strong>無料で利用可能</strong>: 基本的な機能はすべて無料でご利用いただけます。
                会員登録をしなくてもすぐにお使いいただけますので、お気軽にお試しください。
              </li>
              <li>
                <strong>プライバシー保護</strong>: アップロードされた契約書ファイルは、AIによる解析が完了した直後に
                サーバーから完全に削除されます。お客様の大切な個人情報や契約情報が不必要に保存されることはありません。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">対応書類</h2>
            <p>現在、以下の種類の契約書に対応しています。</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>不動産賃貸契約書</strong>: アパート・マンションの賃貸借契約書、重要事項説明書など</li>
              <li><strong>携帯電話契約書</strong>: 携帯電話・スマートフォンの契約書、通信サービス利用規約など</li>
              <li><strong>生命保険・医療保険契約書</strong>: 保険証券、契約のしおり、重要事項説明書など</li>
              <li><strong>住宅ローン契約書</strong>: 金銭消費貸借契約書、住宅ローン契約書、返済計画書など</li>
              <li><strong>雇用契約書・労働条件通知書</strong>: 雇用契約書、労働条件通知書、就業規則の抜粋など</li>
            </ul>
            <p className="mt-2">
              上記以外の契約書についても、一般的な契約書であれば解析可能な場合があります。
              対応書類は今後も順次拡大していく予定です。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">ご利用の流れ</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>契約書をアップロード</strong>: トップページから契約書のPDFファイルまたは画像ファイル（JPG、PNG）をアップロードします。
                ファイルを選択するか、ドラッグ＆ドロップで簡単にアップロードできます。
              </li>
              <li>
                <strong>AIが内容を解析</strong>: アップロードされた契約書の内容をAIが自動的に読み取り、
                重要な条項や注意すべきポイントを分析します。解析には通常数秒から1分程度かかります。
              </li>
              <li>
                <strong>わかりやすい形で結果表示</strong>: 解析結果が画面に表示されます。
                契約の要点、注意すべきポイント、専門用語の解説などが、わかりやすく整理された形でご確認いただけます。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">注意事項</h2>
            <p>
              本サービスはAI（人工知能）による参考情報の提供を目的としており、法的助言や法律相談に該当するものではありません。
              AIの解析結果には誤りが含まれる可能性があり、契約書の内容を完全に網羅することを保証するものではありません。
            </p>
            <p className="mt-2">
              契約の締結や解約など、重要な判断を行う際には、必ず弁護士や司法書士などの法律の専門家にご相談ください。
              本サービスの利用により生じた損害について、運営者は一切の責任を負いかねますので、あらかじめご了承ください。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">運営情報</h2>
            <p>
              「契約書かんたん読み」は個人開発のWebサービスです。
              より多くの方に安心して契約書を読んでいただけるよう、日々改善に取り組んでいます。
              サービスに関するご意見やご要望がございましたら、
              <a href="/contact" className="text-blue-600 hover:underline">お問い合わせページ</a>よりお気軽にご連絡ください。
            </p>
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
