import { XCircle } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { Alert, AlertDescription, AlertTitle } from '@/application/web/components/shadcn/alert'
import { useDebounce } from '@/application/web/hooks/use-debounce'
import createSWRFetcher from '../../features/create-swr-fetcher'
import Page from './page'
import type { UserListResponse } from './types'

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: '20',
    ...(debouncedSearchQuery && { searchQuery: debouncedSearchQuery }),
  }).toString()

  // apiCallの引数にclient入れても良いかも
  const { fetcher, client, apiCall } = createSWRFetcher()

  const { data, error, isLoading, mutate } = useSWR<UserListResponse>(
    `/api/admin/users?${queryParams}`,
    fetcher,
  )

  const { trigger: triggerGrant } = useSWRMutation(
    '/api/admin/users',
    async (_key: string, { arg }: { arg: string }) =>
      apiCall(() => client.admin.users[':id'].$post({ param: { id: arg } })),
  )

  const grantAdminRole = async (userId: string) => {
    try {
      // mutation をトリガー（arg に userId を渡す）
      await triggerGrant(userId)

      // 成功したら一覧を再取得
      await mutate()
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message?: string }).message
          : 'Admin権限の付与に失敗しました'
      toast.error(message)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setPage(1)
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <XCircle />
        <div>
          <AlertTitle>エラーが発生しました</AlertTitle>
          <AlertDescription>ユーザーデータの取得に失敗しました。</AlertDescription>
        </div>
      </Alert>
    )
  }

  return (
    <Page
      data={data}
      loading={isLoading}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
      onClearSearch={handleClearSearch}
      grantAdminRole={grantAdminRole}
    />
  )
}
