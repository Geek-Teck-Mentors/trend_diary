import { XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { Alert, AlertDescription, AlertTitle } from '@/application/web/components/shadcn/alert'
import { getApiErrorMessage } from '@/application/web/lib/error'
import createSWRFetcher from '../../features/create-swr-fetcher'
import Page from './page'
import type { EndpointDetailResponse, EndpointsResponse, PermissionsResponse } from './types'

export default function AdminEndpoints() {
  const [selectedEndpointId, setSelectedEndpointId] = useState<number | null>(null)

  const { fetcher, client, apiCall } = createSWRFetcher()

  // エンドポイント一覧取得
  const {
    data: endpointsData,
    error: endpointsError,
    isLoading: endpointsLoading,
    mutate: mutateEndpoints,
  } = useSWR<EndpointsResponse>('/api/endpoints', fetcher)

  // 権限一覧取得
  const {
    data: permissionsData,
    error: permissionsError,
    isLoading: permissionsLoading,
  } = useSWR<PermissionsResponse>('/api/permissions', fetcher)

  // 選択されたエンドポイントの詳細取得
  const { data: endpointDetailData, mutate: mutateEndpointDetail } = useSWR<EndpointDetailResponse>(
    selectedEndpointId ? `/api/endpoints/${selectedEndpointId}` : null,
    fetcher,
  )

  // エンドポイント作成
  const { trigger: triggerCreateEndpoint } = useSWRMutation(
    '/api/endpoints',
    async (_key: string, { arg }: { arg: { path: string; method: string } }) =>
      apiCall(() => client.endpoints.$post({ json: arg })),
  )

  // エンドポイント削除
  const { trigger: triggerDeleteEndpoint } = useSWRMutation(
    '/api/endpoints',
    async (_key: string, { arg }: { arg: number }) =>
      apiCall(() => client.endpoints[':id'].$delete({ param: { id: arg.toString() } })),
  )

  // エンドポイント権限更新
  const { trigger: triggerUpdateEndpointPermissions } = useSWRMutation(
    '/api/endpoints',
    async (_key: string, { arg }: { arg: { endpointId: number; permissionIds: number[] } }) =>
      apiCall(() =>
        client.endpoints[':id'].permissions.$patch({
          param: { id: arg.endpointId.toString() },
          json: { permissionIds: arg.permissionIds },
        }),
      ),
  )

  const handleCreateEndpoint = async (path: string, method: string) => {
    try {
      await triggerCreateEndpoint({ path, method })
      await mutateEndpoints()
      toast.success('エンドポイントを作成しました')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'エンドポイントの作成に失敗しました'))
    }
  }

  const handleDeleteEndpoint = async (id: number) => {
    try {
      await triggerDeleteEndpoint(id)
      await mutateEndpoints()
      if (selectedEndpointId === id) {
        setSelectedEndpointId(null)
      }
      toast.success('エンドポイントを削除しました')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'エンドポイントの削除に失敗しました'))
    }
  }

  const handleUpdatePermissions = async (permissionIds: number[]) => {
    if (!selectedEndpointId) return

    try {
      await triggerUpdateEndpointPermissions({ endpointId: selectedEndpointId, permissionIds })
      await mutateEndpointDetail()
      toast.success('権限を更新しました')
    } catch (error) {
      toast.error(getApiErrorMessage(error, '権限の更新に失敗しました'))
    }
  }

  if (endpointsError || permissionsError) {
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
      endpoints={endpointsData?.endpoints || []}
      permissions={permissionsData?.permissions || []}
      selectedEndpoint={endpointDetailData?.endpoint || null}
      selectedEndpointPermissions={endpointDetailData?.permissions || []}
      loading={endpointsLoading || permissionsLoading}
      selectedEndpointId={selectedEndpointId}
      onSelectEndpoint={setSelectedEndpointId}
      onCreateEndpoint={handleCreateEndpoint}
      onDeleteEndpoint={handleDeleteEndpoint}
      onUpdatePermissions={handleUpdatePermissions}
    />
  )
}
