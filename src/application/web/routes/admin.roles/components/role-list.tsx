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
import { Input } from '@/application/web/components/shadcn/input'
import { Label } from '@/application/web/components/shadcn/label'
import { Textarea } from '@/application/web/components/shadcn/textarea'
import type { Role } from '../types'

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
              onClick={() => onSelectRole(role.roleId)}
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
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ロール新規作成</DialogTitle>
            <DialogDescription>新しいロールを作成します。</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='name'>ロール名</Label>
              <Input
                id='name'
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder='ロール名を入力'
              />
            </div>
            <div>
              <Label htmlFor='description'>説明</Label>
              <Textarea
                id='description'
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder='ロールの説明を入力'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreate} disabled={!newRoleName}>
              作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ロール編集</DialogTitle>
            <DialogDescription>ロール情報を編集します。</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='edit-name'>ロール名</Label>
              <Input
                id='edit-name'
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder='ロール名を入力'
              />
            </div>
            <div>
              <Label htmlFor='edit-description'>説明</Label>
              <Textarea
                id='edit-description'
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder='ロールの説明を入力'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleEdit} disabled={!newRoleName}>
              更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
