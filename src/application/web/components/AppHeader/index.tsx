import { BookOpen, Menu } from 'lucide-react'
import { useNavigate } from 'react-router'
import { AnchorLink } from '../link'
import { menuItems } from '../Sidebar'
import useSidebar from '../Sidebar/useSidebar'
import { Button } from '../ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet'

type Props = {
  displayName: string
  userFeatureEnabled: boolean
}

export default function AppHeader({ displayName, userFeatureEnabled }: Props) {
  const navigate = useNavigate()
  const { handleLogout, isLoading } = useSidebar(navigate)

  return (
    <header className='border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 md:hidden'>
      <div className='flex justify-between items-center h-16 px-4'>
        <AnchorLink to='/' className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
          <BookOpen className='h-6 w-6' />
          <span className='text-xl font-semibold'>TrendDiary</span>
        </AnchorLink>

        <Sheet>
          <SheetTrigger asChild={true}>
            <Button variant='ghost' size='icon'>
              <Menu className='h-6 w-6' />
              <span className='sr-only'>メニューを開く</span>
            </Button>
          </SheetTrigger>
          <SheetContent side='right'>
            <SheetHeader>
              <SheetTitle>メニュー</SheetTitle>
              <SheetDescription>ナビゲーションとユーザー設定</SheetDescription>
            </SheetHeader>
            <div className='flex flex-col gap-4'>
              <nav className='flex flex-col gap-2'>
                <div className='text-xs font-semibold text-gray-500 px-3'>Application</div>
                {menuItems.map((item) => (
                  <AnchorLink
                    key={item.title}
                    to={item.url}
                    className='flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors'
                  >
                    <item.icon className='h-5 w-5' />
                    <span>{item.title}</span>
                  </AnchorLink>
                ))}
              </nav>

              {userFeatureEnabled && displayName !== 'ゲスト' && displayName !== '未設定' && (
                <div className='border-t pt-4 mt-auto'>
                  <div className='text-xs font-semibold text-gray-500 mb-2 px-3'>User</div>
                  <div className='flex flex-col gap-2 px-3'>
                    <div className='py-2 text-sm'>ユーザー名：{displayName}</div>
                    <Button onClick={handleLogout} disabled={isLoading} variant='outline'>
                      {isLoading ? 'ログアウト中...' : 'ログアウト'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
