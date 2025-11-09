import { BookOpen, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router'
import { isLoggedIn } from '../../../features/authenticate/user-status'
import { InternalPath } from '../../../routes'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from '../../shadcn/sidebar'
import { AnchorLink } from '../link'
import NavMenu from '../nav-menu'
import UserSection from '../user-section'
import useSidebar from './use-sidebar'

export interface MenuItem {
  title: string
  url: InternalPath
  icon: React.ElementType
}

export const menuItems: MenuItem[] = [
  {
    title: 'トレンド記事',
    url: '/trends',
    icon: TrendingUp,
  },
  // {
  //   title: '読んだ記事',
  //   url: '#',
  //   icon: Newspaper,
  // },
]

type Props = {
  displayName: string
  userFeatureEnabled: boolean
}

export default function AppSidebar({ displayName, userFeatureEnabled }: Props) {
  const navigate = useNavigate()
  const { handleLogout, isLoading } = useSidebar(navigate)

  return (
    <div className='hidden md:block'>
      <Sidebar>
        <SidebarHeader>
          <AnchorLink
            to='/'
            className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md transition-colors'
          >
            <BookOpen className='h-6 w-6' />
            <span className='text-xl font-semibold'>TrendDiary</span>
          </AnchorLink>
        </SidebarHeader>
        <SidebarContent className='relative'>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMenu variant='sidebar' menuItems={menuItems} />
            </SidebarGroupContent>
          </SidebarGroup>
          {userFeatureEnabled && isLoggedIn(displayName) && (
            <SidebarGroup className='absolute bottom-0 left-0 w-full'>
              <SidebarGroupLabel>User</SidebarGroupLabel>
              <SidebarGroupContent>
                <UserSection
                  variant='sidebar'
                  displayName={displayName}
                  onLogout={handleLogout}
                  isLoading={isLoading}
                />
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    </div>
  )
}
