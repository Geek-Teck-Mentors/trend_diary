import { AnchorLink } from '../link'

export default function Footer() {
  return (
    <footer className='bg-slate-900 py-8'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col items-center gap-4 text-slate-400'>
          <AnchorLink
            to='/privacy-policy'
            className='text-slate-400 hover:text-white transition-colors'
          >
            プライバシーポリシー
          </AnchorLink>
          <p>&copy; 2025 TrendDiary. 技術トレンドを効率的に管理するツール</p>
        </div>
      </div>
    </footer>
  )
}
