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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/application/web/components/shadcn/select'
import { getMethodColor } from '../http-method'
import type { Endpoint } from '../types'

type Props = {
  endpoints: Endpoint[]
  selectedEndpointId: number | null
  onSelectEndpoint: (endpointId: number | null) => void
  onCreateEndpoint: (path: string, method: string) => Promise<void>
  onDeleteEndpoint: (id: number) => Promise<void>
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

export default function EndpointList({
  endpoints,
  selectedEndpointId,
  onSelectEndpoint,
  onCreateEndpoint,
  onDeleteEndpoint,
}: Props) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingEndpoint, setDeletingEndpoint] = useState<Endpoint | null>(null)
  const [newPath, setNewPath] = useState('')
  const [newMethod, setNewMethod] = useState<string>('GET')

  const handleCreateClick = () => {
    setNewPath('')
    setNewMethod('GET')
    setIsCreateDialogOpen(true)
  }

  const handleDeleteClick = (endpoint: Endpoint, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingEndpoint(endpoint)
    setIsDeleteDialogOpen(true)
  }

  const handleCreate = async () => {
    await onCreateEndpoint(newPath, newMethod)
    setIsCreateDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!deletingEndpoint) return
    await onDeleteEndpoint(deletingEndpoint.endpointId)
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <div className='w-1/2 border-r border-gray-200 flex flex-col'>
        <div className='p-4 border-b border-gray-200 flex justify-between items-center'>
          <h3 className='text-lg font-medium text-gray-900'>エンドポイント一覧</h3>
          <Button size='sm' onClick={handleCreateClick}>
            <Plus className='w-4 h-4 mr-1' />
            新規作成
          </Button>
        </div>

        <div className='flex-1 overflow-y-auto'>
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.endpointId}
              role='button'
              tabIndex={0}
              onClick={() => onSelectEndpoint(endpoint.endpointId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectEndpoint(endpoint.endpointId)
                }
              }}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedEndpointId === endpoint.endpointId
                  ? 'bg-blue-50 border-l-4 border-l-blue-500'
                  : ''
              }`}
            >
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}
                    >
                      {endpoint.method}
                    </span>
                    <span className='font-mono text-sm text-gray-900'>{endpoint.path}</span>
                  </div>
                </div>
                <div className='flex gap-1 ml-2'>
                  <Button size='sm' variant='ghost' onClick={(e) => handleDeleteClick(endpoint, e)}>
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
            <DialogTitle>エンドポイント新規作成</DialogTitle>
            <DialogDescription>新しいエンドポイントを作成します。</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='path'>パス</Label>
              <Input
                id='path'
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                placeholder='例: /api/users/:id'
              />
            </div>
            <div>
              <Label htmlFor='method'>HTTPメソッド</Label>
              <Select value={newMethod} onValueChange={setNewMethod}>
                <SelectTrigger id='method'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTTP_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreate} disabled={!newPath}>
              作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>エンドポイント削除</DialogTitle>
            <DialogDescription>
              {deletingEndpoint?.method} {deletingEndpoint?.path}{' '}
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
    </>
  )
}
