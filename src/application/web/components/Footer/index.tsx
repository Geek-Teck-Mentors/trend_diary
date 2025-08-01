import { TrendingUp } from 'lucide-react'

export default function Footer() {
  return (
    <footer className='bg-slate-900 text-white py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col md:flex-row justify-between items-center'>
          <a
            href='/'
            className='flex items-center space-x-2 mb-4 md:mb-0 hover:opacity-80 transition-opacity'
          >
            <TrendingUp className='h-6 w-6 text-blue-400' />
            <span className='text-xl font-bold'>TrendDiary</span>
          </a>
          <div className='flex space-x-6'>
            <a href='/login' className='text-slate-300 hover:text-white transition-colors'>
              ログイン
            </a>
            <a href='/signup' className='text-slate-300 hover:text-white transition-colors'>
              アカウント作成
            </a>
          </div>
        </div>
        <div className='border-t border-slate-800 mt-8 pt-8 text-center text-slate-400'>
          <p>&copy; 2025 TrendDiary. 技術トレンドを効率的に管理するツール</p>
        </div>
      </div>
    </footer>
  )
}
