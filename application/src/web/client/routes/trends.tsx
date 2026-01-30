import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { SidebarProvider } from '../components/shadcn/sidebar'
import AppHeader from '../components/ui/app-header'
import AppSidebar from '../components/ui/sidebar'
import getApiClientForClient from '../infrastructure/api'

export type TrendsOutletContext = {
  isLoggedIn: boolean
}

// remixではOutletがChildrenの役割を果たす
export default function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    let isMounted = true
    const client = getApiClientForClient()

    const f = async () => {
      const res = await client.v2.auth.me.$get({}, { init: { credentials: 'include' } })
      setIsLoggedIn(res.status === 200)
    }

    if (isMounted) {
      f()
    }
    return () => {
      isMounted = false
    }
  }, [])

  const outletContext: TrendsOutletContext = {
    isLoggedIn,
  }

  return (
    <SidebarProvider>
      <AppSidebar isLoggedIn={isLoggedIn} />
      <div className='w-full'>
        <AppHeader isLoggedIn={isLoggedIn} />
        <Outlet context={outletContext} />
      </div>
    </SidebarProvider>
  )
}
