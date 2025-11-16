import { Plus, Trash2 } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/application/web/components/shadcn/table'
import type { Permission } from './types'

type Props = {
  permissions: Permission[]
  loading: boolean
  onCreatePermission: (resource: string, action: string) => Promise<void>
  onDeletePermission: (id: number) => Promise<void>
}

export default function AdminPermissionsPage({
  permissions,
  loading,
  onCreatePermission,
  onDeletePermission,
}: Props) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingPermission, setDeletingPermission] = useState<Permission | null>(null)
  const [newResource, setNewResource] = useState('')
  const [newAction, setNewAction] = useState('')

  const handleCreateClick = () => {
    setNewResource('')
    setNewAction('')
    setIsCreateDialogOpen(true)
  }

  const handleDeleteClick = (permission: Permission) => {
    setDeletingPermission(permission)
    setIsDeleteDialogOpen(true)
  }

  const handleCreate = async () => {
    await onCreatePermission(newResource, newAction)
    setIsCreateDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!deletingPermission) return
    await onDeletePermission(deletingPermission.permissionId)
    setIsDeleteDialogOpen(false)
  }

  // リソースごとにグループ化
  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = []
      }
      acc[permission.resource].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>権限管理</h2>
          <p className='text-gray-500 mt-1'>システムの権限を管理します</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className='w-4 h-4 mr-2' />
          新規作成
        </Button>
      </div>

      {loading ? (
        <div className='text-center py-12'>
          <p className='text-gray-500'>読み込み中...</p>
        </div>
      ) : (
        <div className='space-y-8'>
          {Object.entries(groupedPermissions).map(([resource, perms]) => (
            <div key={resource} className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900 capitalize'>{resource}</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>アクション</TableHead>
                    <TableHead className='w-20'>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perms.map((permission) => (
                    <TableRow key={permission.permissionId}>
                      <TableCell className='font-medium'>{permission.action}</TableCell>
                      <TableCell>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => handleDeleteClick(permission)}
                        >
                          <Trash2 className='w-4 h-4 text-red-500' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}

      {/* 新規作成ダイアログ */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>権限新規作成</DialogTitle>
            <DialogDescription>新しい権限を作成します。</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='resource'>リソース</Label>
              <Input
                id='resource'
                value={newResource}
                onChange={(e) => setNewResource(e.target.value)}
                placeholder='例: user, article, role'
              />
            </div>
            <div>
              <Label htmlFor='action'>アクション</Label>
              <Input
                id='action'
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                placeholder='例: create, read, update, delete'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreate} disabled={!newResource || !newAction}>
              作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>権限削除</DialogTitle>
            <DialogDescription>
              {deletingPermission?.resource}.{deletingPermission?.action}{' '}
              を削除してもよろしいですか？この操作は取り消せません。
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
    </div>
  )
}
