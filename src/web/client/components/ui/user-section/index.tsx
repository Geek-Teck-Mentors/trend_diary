import { Button } from '../../shadcn/button'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../../shadcn/sidebar'

type UserSectionProps = {
  variant: 'sidebar' | 'sheet'
  displayName: string
  onLogout: () => void
  isLoading: boolean
}

export default function UserSection({
  variant,
  displayName,
  onLogout,
  isLoading,
}: UserSectionProps) {
  if (variant === 'sidebar') {
    return (
      <SidebarMenu>
        <SidebarMenuItem className='w-full'>
          <SidebarMenuButton>ユーザー名:{displayName}</SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={onLogout} disabled={isLoading}>
            {isLoading ? 'ログアウト中...' : 'ログアウト'}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <div className='border-t pt-4 mt-auto'>
      <div className='text-xs font-semibold text-gray-500 mb-2 px-3'>User</div>
      <div className='flex flex-col gap-2 px-3'>
        <div className='py-2 text-sm'>ユーザー名：{displayName}</div>
        <Button onClick={onLogout} disabled={isLoading} variant='outline'>
          {isLoading ? 'ログアウト中...' : 'ログアウト'}
        </Button>
      </div>
    </div>
  )
}
