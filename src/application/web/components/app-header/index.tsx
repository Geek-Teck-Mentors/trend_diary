import { BookOpen, Menu } from 'lucide-react'
import { useNavigate } from 'react-router'
import { isLoggedIn } from '../../features/authenticate/userStatus'
import { AnchorLink } from '../link'
import NavMenu from '../nav-menu'
import { menuItems } from '../Sidebar'
import useSidebar from '../Sidebar/useSidebar'
import UserSection from '../UserSection'
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
              <NavMenu variant='sheet' menuItems={menuItems} />

              {userFeatureEnabled && isLoggedIn(displayName) && (
                <UserSection
                  variant='sheet'
                  displayName={displayName}
                  onLogout={handleLogout}
                  isLoading={isLoading}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
