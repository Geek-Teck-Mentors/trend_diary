import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/application/web/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/application/web/components/shadcn/dialog'
import type { Role } from '../types'
import RoleFormDialog from './role-form-dialog'

type Props = {
  roles: Role[]
  selectedRoleId: number | null
  onSelectRole: (roleId: number | null) => void
  onCreateRole: (displayName: string, description: string | null) => Promise<void>
  onUpdateRole: (id: number, displayName: string, description: string | null) => Promise<void>
  onDeleteRole: (id: number) => Promise<void>
}

export default function RoleList({
  roles,
  selectedRoleId,
  onSelectRole,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
}: Props) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDescription, setNewRoleDescription] = useState('')

  const handleCreateClick = () => {
    setNewRoleName('')
    setNewRoleDescription('')
    setIsCreateDialogOpen(true)
  }

  const handleEditClick = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingRole(role)
    setNewRoleName(role.displayName)
    setNewRoleDescription(role.description || '')
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingRole(role)
    setIsDeleteDialogOpen(true)
  }

  const handleCreate = async () => {
    await onCreateRole(newRoleName, newRoleDescription || null)
    setIsCreateDialogOpen(false)
  }

  const handleEdit = async () => {
    if (!editingRole) return
    await onUpdateRole(editingRole.roleId, newRoleName, newRoleDescription || null)
    setIsEditDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!editingRole) return
    await onDeleteRole(editingRole.roleId)
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <div className='w-1/3 border-r border-gray-200 flex flex-col'>
        <div className='p-4 border-b border-gray-200 flex justify-between items-center'>
          <h3 className='text-lg font-medium text-gray-900'>ロール一覧</h3>
          <Button size='sm' onClick={handleCreateClick}>
            <Plus className='w-4 h-4 mr-1' />
            新規作成
          </Button>
        </div>

        <div className='flex-1 overflow-y-auto'>
          {roles.map((role) => (
            <div
              key={role.roleId}
              role='button'
              tabIndex={0}
              onClick={() => onSelectRole(role.roleId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectRole(role.roleId)
                }
              }}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedRoleId === role.roleId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <div className='font-medium text-gray-900'>{role.displayName}</div>
                  {role.description && (
                    <div className='text-sm text-gray-500 mt-1'>{role.description}</div>
                  )}
                </div>
                <div className='flex gap-1 ml-2'>
                  <Button size='sm' variant='ghost' onClick={(e) => handleEditClick(role, e)}>
                    <Pencil className='w-3 h-3' />
                  </Button>
                  <Button size='sm' variant='ghost' onClick={(e) => handleDeleteClick(role, e)}>
                    <Trash2 className='w-3 h-3 text-red-500' />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 新規作成ダイアログ */}
      <RoleFormDialog
        mode='create'
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        roleName={newRoleName}
        roleDescription={newRoleDescription}
        onRoleNameChange={setNewRoleName}
        onRoleDescriptionChange={setNewRoleDescription}
        onSubmit={handleCreate}
      />

      {/* 編集ダイアログ */}
      <RoleFormDialog
        mode='edit'
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        roleName={newRoleName}
        roleDescription={newRoleDescription}
        onRoleNameChange={setNewRoleName}
        onRoleDescriptionChange={setNewRoleDescription}
        onSubmit={handleEdit}
      />

      {/* 削除確認ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ロール削除</DialogTitle>
            <DialogDescription>
              {editingRole?.displayName} を削除してもよろしいですか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
