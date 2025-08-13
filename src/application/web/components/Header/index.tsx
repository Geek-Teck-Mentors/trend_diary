import { TrendingUp } from 'lucide-react'

type Props = {
  enableUserFeature: boolean
}

export default function Header({ enableUserFeature }: Props) {
  return (
    <header className='border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <a href='/' className='flex items-center space-x-2 hover:opacity-80 transition-opacity'>
            <TrendingUp className='h-8 w-8 text-blue-600' />
            <h1 className='text-2xl font-bold text-slate-900'>TrendDiary</h1>
          </a>
          {enableUserFeature && (
            <div className='flex items-center space-x-4'>
              <a
                href='/login'
                className='inline-flex items-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors duration-200'
              >
                ログイン
              </a>
              <a
                href='/signup'
                className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200'
              >
                アカウント作成
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
