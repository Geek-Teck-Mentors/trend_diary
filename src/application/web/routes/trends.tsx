import { useEffect, useState } from 'react'
import { LoaderFunctionArgs, Outlet, useLoaderData } from 'react-router'
import AppHeader from '../components/AppHeader'
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
  const [displayName, setDisplayName] = useState('')
  const { userFeatureEnabled } = useLoaderData<typeof loader>()

  useEffect(() => {
    if (!userFeatureEnabled) return
    let isMounted = true
    const client = getApiClientForClient()

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
