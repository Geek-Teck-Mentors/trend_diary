import { useEffect, useState } from 'react'
import { LoaderFunctionArgs, Outlet, useLoaderData } from 'react-router'
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
  const [displayName, setDisplayName] = useState('未設定')
  const { userFeatureEnabled } = useLoaderData<typeof loader>()

  useEffect(() => {
    if (!userFeatureEnabled) return
    let isMounted = true
    const client = getApiClientForClient()

  // displayNameの決定ロジック
  const getDisplayName = () => {
    if (error) return 'ゲスト'
    if (!userData) return '未設定'
    return userData.user?.displayName ?? '未設定'
  }

  const displayName = getDisplayName()

  return (
    <SidebarProvider>
      <AppSidebar displayName={displayName} userFeatureEnabled={userFeatureEnabled} />
      <div className='w-full'>
        <Outlet />
      </div>
    </SidebarProvider>
  )
}
