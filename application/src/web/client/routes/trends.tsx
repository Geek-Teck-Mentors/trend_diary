import { useEffect, useState } from 'react'
import { LoaderFunctionArgs, Outlet, useLoaderData } from 'react-router'
import { SidebarProvider } from '../components/shadcn/sidebar'
import AppHeader from '../components/ui/app-header'
import AppSidebar from '../components/ui/sidebar'
import { isUserFeatureEnabled } from '../features/feature-flag'
import getApiClientForClient from '../infrastructure/api'

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare?.env
  return {
    userFeatureEnabled: isUserFeatureEnabled(env),
  }
}

export type TrendsOutletContext = {
  userFeatureEnabled: boolean
  isLoggedIn: boolean
}

// remixではOutletがChildrenの役割を果たす
export default function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { userFeatureEnabled } = useLoaderData<typeof loader>()

  useEffect(() => {
    if (!userFeatureEnabled) return
    let isMounted = true
    const client = getApiClientForClient()

    const f = async () => {
      const res = await client.v2.auth.me.$get({}, { init: { credentials: 'include' } })
      if (res.status === 200) {
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
      }
    }

    if (isMounted) {
      f()
    }
    return () => {
      isMounted = false
    }
  }, [])

  const outletContext: TrendsOutletContext = {
    userFeatureEnabled,
    isLoggedIn,
  }

  return (
    <SidebarProvider>
      <AppSidebar isLoggedIn={isLoggedIn} userFeatureEnabled={userFeatureEnabled} />
      <div className='w-full'>
        <AppHeader isLoggedIn={isLoggedIn} userFeatureEnabled={userFeatureEnabled} />
        <Outlet context={outletContext} />
      </div>
    </SidebarProvider>
  )
}
