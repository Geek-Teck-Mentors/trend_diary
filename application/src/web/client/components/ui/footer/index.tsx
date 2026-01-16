import { AnchorLink } from '../link'

export default function Footer() {
  return (
    <footer className='bg-slate-900 py-8'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col items-center gap-4 text-slate-400'>
          <nav className='flex gap-6'>
            <AnchorLink to='/terms-of-service'>利用規約</AnchorLink>
            <AnchorLink to='/privacy-policy'>プライバシーポリシー</AnchorLink>
            <AnchorLink to='https://forms.gle/HgaE9qMXq6MJAxNG9'>お問い合わせ</AnchorLink>
          </nav>
          <p>&copy; 2025 TrendDiary. 技術トレンドを効率的に管理するツール</p>
        </div>
      </div>
    </footer>
  )
}
