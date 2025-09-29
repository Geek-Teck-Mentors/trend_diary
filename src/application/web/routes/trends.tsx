import { LoaderFunctionArgs, Outlet, useLoaderData } from 'react-router'
import useSWR from 'swr'
import AppSidebar from '../components/Sidebar'
import { SidebarProvider } from '../components/ui/sidebar'
import { isUserFeatureEnabled } from '../features/featureFlag'
import getApiClientForClient from '../infrastructure/api'

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare?.env
  return {
    userFeatureEnabled: isUserFeatureEnabled(env),
  }
}

// remixではOutletがChildrenの役割を果たす
export default function Layout() {
  const { userFeatureEnabled } = useLoaderData<typeof loader>()

  // SWR fetcher function
  const fetcher = async () => {
    const client = getApiClientForClient()
    const res = await client.user.me.$get({}, { init: { credentials: 'include' } })
    if (res.status === 200) {
      const resJson = await res.json()
      return resJson.user?.displayName ?? '未設定'
    } else {
      return 'ゲスト'
    }
  }

  const { data: displayName = '未設定' } = useSWR(
    userFeatureEnabled ? 'user-me' : null,
    fetcher
  )

  return (
    <SidebarProvider>
      <AppSidebar displayName={displayName} userFeatureEnabled={userFeatureEnabled} />
      <div className='w-full'>
        <AppHeader displayName={displayName} userFeatureEnabled={userFeatureEnabled} />
        <Outlet />
      </div>
    </SidebarProvider>
  )
}
