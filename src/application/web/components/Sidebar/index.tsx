import { BookOpen, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router'
import { InternalPath } from '../../routes'
import { AnchorLink } from '../link'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar'
import useSidebar from './useSidebar'

interface MenuItem {
  title: string
  url: InternalPath
  icon: React.ElementType
}

const menuItems: MenuItem[] = [
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
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild={true}>
                    <AnchorLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </AnchorLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {userFeatureEnabled && (
          <SidebarGroup className='absolute bottom-0 left-0 w-full'>
            <SidebarGroupLabel>User</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className='w-full'>
                  <SidebarMenuButton>ユーザー名：{displayName}</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogout} disabled={isLoading}>
                    {isLoading ? 'ログアウト中...' : 'ログアウト'}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
