import { useEffect } from 'react'
import { Outlet, redirect } from 'react-router'
import { toast } from 'sonner'
import LinkAsButton from '../components/linkAsButton'
import getApiClientForClient from '../infrastructure/api'

export default function AdminLayout() {
  useEffect(() => {
    let isMounted = true
    const client = getApiClientForClient()

    const f = async () => {
      const res = await client.user.me.$get({}, { init: { credentials: 'include' } })
      if (res.status === 200) {
        const resJson = await res.json()
        if (!resJson.user.isAdmin) {
          toast.error('管理者ログインが必要です')
          redirect('/login')
        }
        return
      } else if (res.status >= 400 && res.status < 500) {
        toast.error('管理者ログインが必要です')
      } else {
        toast.error('不明のエラーが発生しました')
      }
      redirect('/login')
    }

    if (isMounted) {
      f()
    }
    return () => {
      isMounted = false
    }
  }, [])
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center'>
              <LinkAsButton to='/admin'>
                <h1 className='text-2xl font-bold text-gray-900'>管理者画面</h1>
              </LinkAsButton>
            </div>
            <nav className='flex space-x-8'>
              <LinkAsButton to='/admin/users'>ユーザ管理</LinkAsButton>
            </nav>
          </div>
        </div>
      </div>

      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
