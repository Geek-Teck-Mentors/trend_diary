import { XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { Alert, AlertDescription, AlertTitle } from '@/application/web/components/shadcn/alert'
import { getApiErrorMessage } from '@/application/web/lib/error'
import createSWRFetcher from '../../features/create-swr-fetcher'
import Page from './page'
import type { PermissionsResponse, RoleDetailResponse, RolesResponse } from './types'

export default function AdminRoles() {
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)

  const { fetcher, client, apiCall } = createSWRFetcher()

  // ロール一覧取得
  const {
    data: rolesData,
    error: rolesError,
    isLoading: rolesLoading,
    mutate: mutateRoles,
  } = useSWR<RolesResponse>('/api/roles', fetcher)

  // 権限一覧取得
  const {
    data: permissionsData,
    error: permissionsError,
    isLoading: permissionsLoading,
  } = useSWR<PermissionsResponse>('/api/permissions', fetcher)

  // 選択されたロールの詳細取得
  const { data: roleDetailData, mutate: mutateRoleDetail } = useSWR<RoleDetailResponse>(
    selectedRoleId ? `/api/roles/${selectedRoleId}` : null,
    fetcher,
  )

  // ロール作成
  const { trigger: triggerCreateRole } = useSWRMutation(
    '/api/roles',
    async (_key: string, { arg }: { arg: { displayName: string; description: string | null } }) =>
      apiCall(() => client.roles.$post({ json: arg })),
  )

  // ロール更新
  const { trigger: triggerUpdateRole } = useSWRMutation(
    '/api/roles',
    async (
      _key: string,
      { arg }: { arg: { id: number; displayName: string; description: string | null } },
    ) =>
      apiCall(() =>
        client.roles[':id'].$patch({
          param: { id: `${arg.id}` },
          json: { displayName: arg.displayName, description: arg.description },
        }),
      ),
  )

  // ロール削除
  const { trigger: triggerDeleteRole } = useSWRMutation(
    '/api/roles',
    async (_key: string, { arg }: { arg: number }) =>
      apiCall(() => client.roles[':id'].$delete({ param: { id: `${arg}` } })),
  )

  // ロール権限更新
  const { trigger: triggerUpdateRolePermissions } = useSWRMutation(
    '/api/roles',
    async (_key: string, { arg }: { arg: { roleId: number; permissionIds: number[] } }) =>
      apiCall(() =>
        client.roles[':id'].permissions.$patch({
          param: { id: `${arg.roleId}` },
          json: { permissionIds: arg.permissionIds },
        }),
      ),
  )

  const handleCreateRole = async (displayName: string, description: string | null) => {
    try {
      await triggerCreateRole({ displayName, description })
      await mutateRoles()
      toast.success('ロールを作成しました')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'ロールの作成に失敗しました'))
    }
  }

  const handleUpdateRole = async (id: number, displayName: string, description: string | null) => {
    try {
      await triggerUpdateRole({ id, displayName, description })
      await mutateRoles()
      await mutateRoleDetail()
      toast.success('ロールを更新しました')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'ロールの更新に失敗しました'))
    }
  }

  const handleDeleteRole = async (id: number) => {
    try {
      await triggerDeleteRole(id)
      await mutateRoles()
      if (selectedRoleId === id) {
        setSelectedRoleId(null)
      }
      toast.success('ロールを削除しました')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'ロールの削除に失敗しました'))
    }
  }

  const handleUpdatePermissions = async (permissionIds: number[]) => {
    if (!selectedRoleId) return

    try {
      await triggerUpdateRolePermissions({ roleId: selectedRoleId, permissionIds })
      await mutateRoleDetail()
      toast.success('権限を更新しました')
    } catch (error) {
      toast.error(getApiErrorMessage(error, '権限の更新に失敗しました'))
    }
  }

  if (rolesError || permissionsError) {
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
      roles={rolesData?.roles || []}
      permissions={permissionsData?.permissions || []}
      selectedRole={roleDetailData?.role || null}
      selectedRolePermissions={roleDetailData?.permissions || []}
      loading={rolesLoading || permissionsLoading}
      selectedRoleId={selectedRoleId}
      onSelectRole={setSelectedRoleId}
      onCreateRole={handleCreateRole}
      onUpdateRole={handleUpdateRole}
      onDeleteRole={handleDeleteRole}
      onUpdatePermissions={handleUpdatePermissions}
    />
  )
}
