import { BookOpen, Newspaper, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router'
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

const menuItems = [
  {
    title: 'トレンド記事',
    url: '/trends',
    icon: TrendingUp,
  },
  {
    title: '読んだ記事',
    url: '#',
    icon: Newspaper,
  },
]

type Props = {
  displayName: string
}

export default function AppSidebar({ displayName }: Props) {
  const navigate = useNavigate()
  const { handleLogout, isLoading } = useSidebar(navigate)

  return (
    <Sidebar>
      <SidebarHeader>
        <div className='flex items-center gap-2 px-4 py-2'>
          <BookOpen className='h-6 w-6' />
          <span className='text-xl font-semibold'>TrendDiary</span>
        </div>
      </SidebarHeader>
      <SidebarContent className='relative'>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild={true}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
