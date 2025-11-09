import { UserListResponse } from '@/application/api/admin/getUserList'
import LoadingSpinner from '../../components/ui/loading-spinner'
import DataTable, { DataTableProps } from './components/data-table'
import SearchForm from './components/search-form'

type Props = {
  data?: UserListResponse
  loading: boolean
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearchSubmit: (e: React.FormEvent) => void
  onClearSearch: () => void
  grantAdminRole: DataTableProps['grantAdminRole']
}

export default function Page({
  data,
  loading,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  grantAdminRole,
}: Props) {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold text-gray-900'>ユーザ管理</h2>
      </div>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        {!data || loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className='px-6 py-4 border-b border-gray-200 flex justify-between items-center'>
              <h3 className='text-lg font-medium text-gray-900'>ユーザ一覧</h3>
              <SearchForm
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                onSubmit={onSearchSubmit}
                onClear={onClearSearch}
              />
            </div>
            {data.users.length === 0 ? (
              <div className='p-6 text-center'>
                <p className='text-gray-500'>ユーザーが見つかりませんでした</p>
              </div>
            ) : (
              <DataTable users={data.users} grantAdminRole={grantAdminRole} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
