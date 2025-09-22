import { Outlet } from 'react-router'
import useSWR from 'swr'
import AppSidebar from '../components/Sidebar'
import { SidebarProvider } from '../components/ui/sidebar'
import { createSWRFetcher } from '../features/createSWRFetcher'

interface UserMeResponse {
  user?: {
    displayName?: string
    // 他の必要なプロパティをここに追加
  }
}

// remixではOutletがChildrenの役割を果たす
export default function Layout() {
  const { client, apiCall } = createSWRFetcher()

  const { data: userData, error } = useSWR<UserMeResponse>(
    'user/me',
    async (): Promise<UserMeResponse> => {
      return apiCall(() =>
        client.user.me.$get({}, { init: { credentials: 'include' } })
      )
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 2,
      fallbackData: undefined,
    }
  )

  // displayNameの決定ロジック
  const getDisplayName = () => {
    if (error) return 'ゲスト'
    if (!userData) return '未設定'
    return userData.user?.displayName ?? '未設定'
  }

  const displayName = getDisplayName()

  return (
    <SidebarProvider>
      <AppSidebar displayName={displayName} />
      <div className='w-full'>
        <Outlet />
      </div>
    </SidebarProvider>
  )
}
