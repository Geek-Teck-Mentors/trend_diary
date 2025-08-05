import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import AppSidebar from '../components/Sidebar'
import { SidebarProvider } from '../components/ui/sidebar'
import getApiClientForClient from '../infrastructure/api'

// remixではOutletがChildrenの役割を果たす
export default function Layout() {
  const [displayName, setDisplayName] = useState('未設定')

  useEffect(() => {
    let isMounted = true
    const client = getApiClientForClient()

    const f = async () => {
      const res = await client.user.me.$get({}, { init: { credentials: 'include' } })
      if (res.status === 200) {
        const resJson = await res.json()
        setDisplayName(resJson.user?.displayName ?? '未設定')
      } else {
        setDisplayName('ゲスト')
      }
    }

    if (isMounted) {
      f()
    }
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar displayName={displayName} />
      <div className='w-full'>
        <Outlet />
      </div>
    </SidebarProvider>
  )
}
