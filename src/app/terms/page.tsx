import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約 — 契約書かんたん読み',
  description: '契約書かんたん読みの利用規約です。ご利用前に必ずお読みください。',
}

export default function TermsPage() {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">利用規約</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 text-sm text-gray-700 leading-relaxed">

          <p>
            この利用規約（以下「本規約」）は、契約書かんたん読み（以下「本サービス」）の利用条件を定めるものです。
            ユーザーの皆さま（以下「ユーザー」）には、本規約に同意いただいた上で、本サービスをご利用いただきます。
          </p>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">第1条（適用）</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>本規約は、ユーザーと本サービスの運営者（以下「運営者」）との間の本サービスの利用に関わる一切の関係に適用されるものとします。</li>
              <li>運営者が本サービス上で掲載するプライバシーポリシーその他の規程は、本規約の一部を構成するものとします。</li>
              <li>ユーザーが本サービスを利用した時点で、本規約に同意したものとみなします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">第2条（サービス内容）</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>本サービスは、AI（人工知能）を活用して契約書の内容を解析し、わかりやすく整理した参考情報を提供するWebサービスです。</li>
              <li>本サービスが提供する情報は、あくまで参考情報であり、法的助言、法律相談、または専門家の意見に代わるものではありません。</li>
              <li>本サービスは、不動産賃貸契約書、携帯電話契約書、保険契約書、住宅ローン契約書、雇用契約書等の解析に対応しています。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">第3条（利用条件）</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>本サービスは無料でご利用いただけます。</li>
              <li>アカウント登録をしなくても基本的な機能をご利用いただけます。解析履歴の保存機能を利用する場合は、アカウント登録が必要です。</li>
              <li>アカウント登録は、Googleアカウントによる認証またはメールアドレスとパスワードによる登録が可能です。</li>
              <li>ユーザーは、自己の責任において本サービスを利用するものとし、本サービスの利用に関して行った一切の行為およびその結果について責任を負うものとします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">第4条（禁止事項）</h2>
            <p>ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
            <ol className="list-decimal pl-5 space-y-1 mt-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>本サービスのサーバーまたはネットワークに不正にアクセスする行為、または過度な負荷をかける行為</li>
              <li>本サービスの運営を妨害するおそれのある行為</li>
              <li>商用利用を目的としたスクレイピング、クローリング、またはデータの自動収集を行う行為</li>
              <li>違法な書類、偽造書類、または第三者の権利を侵害する書類をアップロードする行為</li>
              <li>他のユーザーに関する個人情報等を無断で収集または蓄積する行為</li>
              <li>本サービスを通じて取得した情報を、不正な目的で利用する行為</li>
              <li>その他、運営者が不適切と判断する行為</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">第5条（免責事項）</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>本サービスが提供するAI解析の結果は参考情報であり、法的助言ではありません。契約の締結・解除等の重要な判断を行う際は、必ず弁護士等の専門家にご相談ください。</li>
              <li>運営者は、AI解析結果の正確性、完全性、有用性、特定目的への適合性について、いかなる保証も行いません。</li>
              <li>運営者は、本サービスの利用により生じたいかなる損害（直接的、間接的、偶発的、結果的損害を含む）について、一切の責任を負いません。</li>
              <li>運営者は、本サービスの提供の中断、停止、終了、利用不能、変更等に関して、ユーザーまたは第三者に対していかなる責任も負いません。</li>
              <li>運営者は、ユーザーが本サービスを利用して第三者との間で生じた紛争について、一切関与せず、責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">第6条（知的財産権）</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>本サービスに関する知的財産権（著作権、商標権等を含む）は、運営者または正当な権利を有する第三者に帰属します。</li>
              <li>ユーザーがアップロードした契約書の権利は、ユーザーまたは当該契約書の権利者に帰属します。</li>
              <li>本サービスの利用許諾は、本サービスに関する運営者の知的財産権の使用許諾を意味するものではありません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">第7条（サービスの変更・停止）</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>運営者は、事前の通知なく、本サービスの内容を変更し、または本サービスの提供を停止もしくは中止することができるものとします。</li>
              <li>運営者は、本サービスの変更、停止、または中止により、ユーザーまたは第三者に生じた損害について、一切の責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">第8条（個人情報）</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>運営者は、本サービスの利用によって取得する個人情報を、別途定める「<a href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</a>」に従い、適切に取り扱うものとします。</li>
              <li>ユーザーは、本サービスの利用にあたり、プライバシーポリシーに同意するものとします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">第9条（広告の表示）</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>本サービスは、Google AdSense等の広告配信サービスを利用して広告を表示する場合があります。</li>
              <li>広告配信事業者は、ユーザーの興味に応じた広告を表示するために、Cookie（クッキー）を使用することがあります。</li>
              <li>ユーザーは、広告配信事業者のウェブサイトにアクセスし、Cookieの使用を無効にすることができます。</li>
              <li>広告の内容に関するお問い合わせは、各広告主または広告配信事業者にお願いいたします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">第10条（規約の変更）</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>運営者は、必要と判断した場合には、ユーザーに通知することなく、いつでも本規約を変更することができるものとします。</li>
              <li>変更後の利用規約は、本サービス上に掲載した時点から効力を生じるものとします。</li>
              <li>本規約の変更後に本サービスを利用した場合、当該ユーザーは変更後の規約に同意したものとみなします。</li>
            </ol>
          </section>

          <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
            制定日: 2026年3月29日
          </p>
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
