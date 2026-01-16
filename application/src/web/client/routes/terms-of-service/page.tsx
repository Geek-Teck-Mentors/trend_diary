import Footer from '../../components/ui/footer'
import LandingHeader from '../../components/ui/landing-header'

export default function TermsOfServicePage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-white'>
      <LandingHeader enableUserFeature={false} />
      <main className='mx-auto max-w-3xl px-4 py-12'>
        <article className='text-slate-700'>
          <h1 className='mb-8 text-3xl font-bold text-slate-900'>利用規約</h1>
          <p className='mb-6 leading-relaxed'>
            本利用規約（以下「本規約」）は、TrendDiary（以下「本サービス」）の利用条件を定めるものです。ユーザーは本サービスを利用することにより、本規約に同意したものとみなされます。
          </p>

          <h2 className='mb-4 mt-8 text-xl font-bold text-slate-900'>第1条（適用）</h2>
          <p className='mb-6 leading-relaxed'>
            本規約は、ユーザーと本サービス運営チーム（以下「運営者」）との間の本サービスの利用に関わる一切の関係に適用されるものとします。
          </p>

          <h2 className='mb-4 mt-8 text-xl font-bold text-slate-900'>第2条（利用登録）</h2>
          <ol className='mb-4 list-decimal space-y-2 pl-6'>
            <li>
              ユーザーは、本規約に同意の上、運営者の定める方法によって利用登録を申請するものとします。
            </li>
            <li>ユーザーは、1人につき1つのアカウントのみ作成できるものとします。</li>
            <li>
              運営者は、利用登録の申請者に以下の事由があると判断した場合、利用登録の承認を行わないことがあります：
              <ul className='mt-2 list-disc space-y-1 pl-6'>
                <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
                <li>本規約に違反したことがある者からの申請である場合</li>
                <li>その他、運営者が利用登録を相当でないと判断した場合</li>
              </ul>
            </li>
          </ol>

          <h2 className='mb-4 mt-8 text-xl font-bold text-slate-900'>第3条（アカウント管理）</h2>
          <ol className='mb-4 list-decimal space-y-2 pl-6'>
            <li>
              ユーザーは、自己の責任において、本サービスのアカウント情報（ID、パスワード等）を適切に管理するものとします。
            </li>
            <li>
              ユーザーは、いかなる場合にも、アカウント情報を第三者に譲渡または貸与することはできません。
            </li>
            <li>
              アカウント情報の管理不十分、使用上の過誤、第三者の使用等によって生じた損害について、運営者は一切の責任を負わないものとします。
            </li>
          </ol>

          <h2 className='mb-4 mt-8 text-xl font-bold text-slate-900'>第4条（禁止事項）</h2>
          <p className='mb-4 leading-relaxed'>
            ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：
          </p>
          <ol className='mb-4 list-decimal space-y-1 pl-6'>
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>本サービスの運営を妨害するおそれのある行為</li>
            <li>
              運営者、他のユーザー、または第三者の知的財産権、肖像権、プライバシー権その他の権利または利益を侵害する行為
            </li>
            <li>他のユーザーに成りすます行為</li>
            <li>運営者が許諾しない本サービス上での宣伝、広告、勧誘、または営業行為</li>
            <li>本サービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
            <li>過度にサーバーに負荷をかける行為</li>
            <li>本サービスの不具合を意図的に利用する行為</li>
            <li>不正アクセスまたはこれに類する行為</li>
            <li>複数のアカウントを作成する行為</li>
            <li>その他、運営者が不適当と判断する行為</li>
          </ol>

          <h2 className='mb-4 mt-8 text-xl font-bold text-slate-900'>
            第5条（本サービスの提供の停止等）
          </h2>
          <ol className='mb-4 list-decimal space-y-2 pl-6'>
            <li>
              運営者は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします：
              <ul className='mt-2 list-disc space-y-1 pl-6'>
                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>
                  地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合
                </li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、運営者が本サービスの提供が困難と判断した場合</li>
              </ul>
            </li>
            <li>
              運営者は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。
            </li>
          </ol>

          <h2 className='mb-4 mt-8 text-xl font-bold text-slate-900'>
            第6条（利用制限および登録抹消）
          </h2>
          <ol className='mb-4 list-decimal space-y-2 pl-6'>
            <li>
              運営者は、ユーザーが以下のいずれかに該当する場合、事前の通知なく、ユーザーに対して本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします：
              <ul className='mt-2 list-disc space-y-1 pl-6'>
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録事項に虚偽の事実があることが判明した場合</li>
                <li>その他、運営者が本サービスの利用を適当でないと判断した場合</li>
              </ul>
            </li>
            <li>
              運営者は、本条に基づき運営者が行った行為によりユーザーに生じた損害について、一切の責任を負いません。
            </li>
          </ol>

          <h2 className='mb-4 mt-8 text-xl font-bold text-slate-900'>
            第7条（コンテンツの利用権限）
          </h2>
          <ol className='mb-4 list-decimal space-y-2 pl-6'>
            <li>
              ユーザーが本サービス上で作成した読了記録、メモ等のコンテンツ（以下「ユーザーコンテンツ」）の著作権はユーザーに帰属します。
            </li>
            <li>
              ユーザーは、運営者に対し、ユーザーコンテンツを以下の目的で利用することを許諾するものとします：
              <ul className='mt-2 list-disc space-y-1 pl-6'>
                <li>本サービスの提供・運営</li>
                <li>サービス改善のための分析</li>
                <li>その他、本サービスの提供に必要な範囲での利用</li>
              </ul>
            </li>
            <li>
              ユーザーは、ユーザーコンテンツについて、運営者および他のユーザーに対し著作者人格権を行使しないものとします。
            </li>
          </ol>

          <h2 className='mb-4 mt-8 text-xl font-bold text-slate-900'>第8条（料金）</h2>
          <ol className='mb-4 list-decimal space-y-2 pl-6'>
            <li>本サービスは現在無料で提供していますが、将来的に有料化する可能性があります。</li>
            <li>有料化を行う場合、運営者は事前にユーザーに通知するものとします。</li>
            <li>料金の支払い方法、返金等の詳細は、有料化時に別途定めるものとします。</li>
          </ol>

          <h2 className='mb-4 mt-8 text-xl font-bold text-slate-900'>第9条（免責事項）</h2>
          <ol className='mb-4 list-decimal space-y-2 pl-6'>
            <li>
              運営者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
            </li>
            <li>
              運営者は、本サービスに起因してユーザーに生じたあらゆる損害について、運営者の故意または重過失による場合を除き、一切の責任を負いません。
            </li>
            <li>
              運営者は、ユーザーのデータの消失、破損等について一切の責任を負いません。ユーザーは自己の責任においてデータのバックアップ等を行うものとします。
            </li>
          </ol>

          <h2 className='mb-4 mt-8 text-xl font-bold text-slate-900'>第10条（サービス終了）</h2>
          <p className='mb-6 leading-relaxed'>
            運営者は、運営者の判断により、本サービスの全部または一部を予告なく終了することができるものとします。サービス終了により生じるユーザーの損害について、運営者は一切の責任を負いません。
          </p>

          <h2 className='mb-4 mt-8 text-xl font-bold text-slate-900'>第11条（規約の変更）</h2>
          <ol className='mb-4 list-decimal space-y-2 pl-6'>
            <li>
              運営者は、ユーザーに通知することにより、いつでも本規約を変更することができるものとします。
            </li>
            <li>変更後の規約は、本サービス上に掲示された時点から効力を生じるものとします。</li>
            <li>
              規約変更後にユーザーが本サービスを利用した場合、変更後の規約に同意したものとみなします。
            </li>
          </ol>

          <h2 className='mb-4 mt-8 text-xl font-bold text-slate-900'>第12条（個人情報の取扱い）</h2>
          <p className='mb-6 leading-relaxed'>
            運営者は、本サービスの利用によって取得する個人情報については、プライバシーポリシーに従い適切に取り扱うものとします。
          </p>

          <h2 className='mb-4 mt-8 text-xl font-bold text-slate-900'>第13条（準拠法）</h2>
          <p className='mb-6 leading-relaxed'>本規約の解釈にあたっては、日本法を準拠法とします。</p>

          <h2 className='mb-4 mt-8 text-xl font-bold text-slate-900'>第14条（紛争解決）</h2>
          <p className='mb-6 leading-relaxed'>
            本サービスに関して紛争が生じた場合、当事者間で誠実に協議するものとします。
          </p>

          <hr className='my-8 border-slate-200' />

          <p className='text-sm text-slate-600'>
            <strong>制定日：</strong> 2025年1月16日
            <br />
            <strong>最終更新日：</strong> 2025年1月16日
          </p>
        </article>
      </main>
      <Footer />
    </div>
  )
}
