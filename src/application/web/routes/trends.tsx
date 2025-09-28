import { LoaderFunctionArgs, Outlet, useLoaderData } from 'react-router'
import useSWR from 'swr'
import AppSidebar from '../components/Sidebar'
import { SidebarProvider } from '../components/ui/sidebar'
import { createSWRFetcher } from '../features/createSWRFetcher'
import { isUserFeatureEnabled } from '../features/featureFlag'

interface UserMeResponse {
  user?: {
    displayName?: string
    // 他の必要なプロパティをここに追加
  }
}

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare?.env
  return {
    userFeatureEnabled: isUserFeatureEnabled(env),
  }
}

// remixではOutletがChildrenの役割を果たす
export default function Layout() {
  const { userFeatureEnabled } = useLoaderData<typeof loader>()
  const { client, apiCall } = createSWRFetcher()

  const { data: userData, error } = useSWR<UserMeResponse>(
    'user/me',
    async (): Promise<UserMeResponse> => {
      return apiCall(() => client.user.me.$get({}, { init: { credentials: 'include' } }))
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 2,
      fallbackData: undefined,
      onError: (error) => {
        const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました'
        // エラーログはSWRの内部で処理される
      },
    },
  )

    const f = async () => {
      const res = await client.user.me.$get({}, { init: { credentials: 'include' } })
      if (res.status === 200) {
        const resJson = await res.json()
        setDisplayName(resJson.user?.displayName ?? '')
      } else {
        setDisplayName('')
      }
    }

  const displayName = getDisplayName()

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
