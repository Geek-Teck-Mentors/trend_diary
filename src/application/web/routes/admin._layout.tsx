import { Outlet } from 'react-router'
import { LinkAsButton } from '../components/link'

export default function AdminLayout() {
  // TODO: 管理者権限チェックはサーバーサイドのauthMiddleware + requiredAdminで実施
  // フロントエンド側でのチェックは不要（サーバーサイドで401/403が返る）
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
