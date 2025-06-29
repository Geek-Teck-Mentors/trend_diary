import React, { useEffect, useState } from 'react'
import { Outlet, redirect } from '@remix-run/react'
import { toast } from 'sonner'
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
      const res = await client.account.me.$get(
        {},
        { init: { credentials: 'include', mode: 'cors' } },
      )
      if (res.status === 200) {
        const resJson = await res.json()
        setDisplayName(resJson.user?.displayName ?? '未設定')
      } else {
        toast.error('ログインが必要です')
        redirect('/login')
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
