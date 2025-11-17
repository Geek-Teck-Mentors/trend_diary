import { XCircle } from 'lucide-react'
import { toast } from 'sonner'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { Alert, AlertDescription, AlertTitle } from '@/application/web/components/shadcn/alert'
import { getApiErrorMessage } from '@/application/web/lib/error'
import createSWRFetcher from '../../features/create-swr-fetcher'
import Page from './page'
import type { PermissionsResponse } from './types'

export default function AdminPermissions() {
  const { fetcher, client, apiCall } = createSWRFetcher()

  // 権限一覧取得
  const {
    data: permissionsData,
    error: permissionsError,
    isLoading: permissionsLoading,
    mutate: mutatePermissions,
  } = useSWR<PermissionsResponse>('/api/permissions', fetcher)

  // 権限作成
  const { trigger: triggerCreatePermission } = useSWRMutation(
    '/api/permissions',
    async (_key: string, { arg }: { arg: { resource: string; action: string } }) =>
      apiCall(() => client.permissions.$post({ json: arg })),
  )

  // 権限削除
  const { trigger: triggerDeletePermission } = useSWRMutation(
    '/api/permissions',
    async (_key: string, { arg }: { arg: number }) =>
      apiCall(() => client.permissions[':id'].$delete({ param: { id: arg.toString() } })),
  )

  const handleCreatePermission = async (resource: string, action: string) => {
    try {
      await triggerCreatePermission({ resource, action })
      await mutatePermissions()
      toast.success('権限を作成しました')
    } catch (error) {
      toast.error(getApiErrorMessage(error, '権限の作成に失敗しました'))
    }
  }

  const handleDeletePermission = async (id: number) => {
    try {
      await triggerDeletePermission(id)
      await mutatePermissions()
      toast.success('権限を削除しました')
    } catch (error) {
      toast.error(getApiErrorMessage(error, '権限の削除に失敗しました'))
    }
  }

  if (permissionsError) {
    return (
      <Alert variant='destructive'>
        <XCircle />
        <div>
          <AlertTitle>エラーが発生しました</AlertTitle>
          <AlertDescription>データの取得に失敗しました。</AlertDescription>
        </div>
      </Alert>
    )
  }

  return (
    <Page
      permissions={permissionsData?.permissions || []}
      loading={permissionsLoading}
      onCreatePermission={handleCreatePermission}
      onDeletePermission={handleDeletePermission}
    />
  )
}
