import { Check, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/application/web/components/shadcn/button'
import { Checkbox } from '@/application/web/components/shadcn/checkbox'
import type { Permission, Role } from '../types'

type Props = {
  selectedRole: Role | null
  allPermissions: Permission[]
  selectedRolePermissions: Permission[]
  onUpdatePermissions: (permissionIds: number[]) => Promise<void>
}

export default function PermissionPanel({
  selectedRole,
  allPermissions,
  selectedRolePermissions,
  onUpdatePermissions,
}: Props) {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  // selectedRolePermissionsが変更されたら、selectedPermissionIdsを更新
  useEffect(() => {
    const ids = selectedRolePermissions.map((p) => p.permissionId)
    setSelectedPermissionIds(ids)
    setHasChanges(false)
  }, [selectedRolePermissions])

  if (!selectedRole) {
    return (
      <div className='flex-1 flex items-center justify-center text-gray-500'>
        ロールを選択してください
      </div>
    )
  }

  // リソースごとにグループ化
  const groupedPermissions = allPermissions.reduce(
    (acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = []
      }
      acc[permission.resource].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissionIds((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId)
      }
      return [...prev, permissionId]
    })
    setHasChanges(true)
  }

  const handleSelectAll = (resourcePermissions: Permission[]) => {
    const resourcePermissionIds = resourcePermissions.map((p) => p.permissionId)
    const allSelected = resourcePermissionIds.every((id) => selectedPermissionIds.includes(id))

    if (allSelected) {
      // すべて選択されている場合は、すべて解除
      setSelectedPermissionIds((prev) => prev.filter((id) => !resourcePermissionIds.includes(id)))
    } else {
      // 一部または何も選択されていない場合は、すべて選択
      setSelectedPermissionIds((prev) => [
        ...prev.filter((id) => !resourcePermissionIds.includes(id)),
        ...resourcePermissionIds,
      ])
    }
    setHasChanges(true)
  }

  const handleSave = async () => {
    await onUpdatePermissions(selectedPermissionIds)
    setHasChanges(false)
  }

  const handleCancel = () => {
    const ids = selectedRolePermissions.map((p) => p.permissionId)
    setSelectedPermissionIds(ids)
    setHasChanges(false)
  }

  return (
    <div className='flex-1 flex flex-col'>
      <div className='p-4 border-b border-gray-200'>
        <div className='flex justify-between items-center'>
          <div>
            <h3 className='text-lg font-medium text-gray-900'>{selectedRole.displayName}</h3>
            {selectedRole.description && (
              <p className='text-sm text-gray-500 mt-1'>{selectedRole.description}</p>
            )}
          </div>
          {hasChanges && (
            <div className='flex gap-2'>
              <Button size='sm' variant='outline' onClick={handleCancel}>
                <X className='w-4 h-4 mr-1' />
                キャンセル
              </Button>
              <Button size='sm' onClick={handleSave}>
                <Save className='w-4 h-4 mr-1' />
                保存
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-6'>
        {Object.entries(groupedPermissions).map(([resource, permissions]) => {
          const resourcePermissionIds = permissions.map((p) => p.permissionId)
          const selectedCount = resourcePermissionIds.filter((id) =>
            selectedPermissionIds.includes(id),
          ).length
          const allSelected = selectedCount === resourcePermissionIds.length

          return (
            <div key={resource} className='border border-gray-200 rounded-lg p-4'>
              <div
                className='flex items-center justify-between mb-3 cursor-pointer'
                onClick={() => handleSelectAll(permissions)}
              >
                <h4 className='font-medium text-gray-900 capitalize flex items-center'>
                  <Checkbox
                    checked={allSelected}
                    className='mr-2'
                    onCheckedChange={() => handleSelectAll(permissions)}
                  />
                  {resource}
                  <span className='ml-2 text-sm text-gray-500'>
                    ({selectedCount}/{resourcePermissionIds.length})
                  </span>
                </h4>
              </div>

              <div className='space-y-2 ml-6'>
                {permissions.map((permission) => {
                  const isChecked = selectedPermissionIds.includes(permission.permissionId)
                  return (
                    <label
                      key={permission.permissionId}
                      className='flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded'
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleTogglePermission(permission.permissionId)}
                      />
                      <span className='text-sm text-gray-700'>
                        {permission.action}
                        {isChecked && <Check className='w-4 h-4 inline ml-2 text-green-500' />}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
