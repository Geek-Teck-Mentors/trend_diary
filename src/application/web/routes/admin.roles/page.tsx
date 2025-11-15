import LoadingSpinner from '../../components/ui/loading-spinner'
import PermissionPanel from './components/permission-panel'
import RoleList from './components/role-list'
import type { Permission, Role } from './types'

type Props = {
  roles: Role[]
  permissions: Permission[]
  selectedRole: Role | null
  selectedRolePermissions: Permission[]
  loading: boolean
  selectedRoleId: number | null
  onSelectRole: (roleId: number | null) => void
  onCreateRole: (displayName: string, description: string | null) => Promise<void>
  onUpdateRole: (id: number, displayName: string, description: string | null) => Promise<void>
  onDeleteRole: (id: number) => Promise<void>
  onUpdatePermissions: (permissionIds: number[]) => Promise<void>
}

export default function Page({
  roles,
  permissions,
  selectedRole,
  selectedRolePermissions,
  loading,
  selectedRoleId,
  onSelectRole,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
  onUpdatePermissions,
}: Props) {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold text-gray-900'>ロール管理</h2>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className='bg-white shadow rounded-lg overflow-hidden'>
          <div className='flex h-[600px]'>
            {/* 左側：ロール一覧 */}
            <RoleList
              roles={roles}
              selectedRoleId={selectedRoleId}
              onSelectRole={onSelectRole}
              onCreateRole={onCreateRole}
              onUpdateRole={onUpdateRole}
              onDeleteRole={onDeleteRole}
            />

            {/* 右側：権限設定パネル */}
            <PermissionPanel
              selectedRole={selectedRole}
              allPermissions={permissions}
              selectedRolePermissions={selectedRolePermissions}
              onUpdatePermissions={onUpdatePermissions}
            />
          </div>
        </div>
      )}
    </div>
  )
}
