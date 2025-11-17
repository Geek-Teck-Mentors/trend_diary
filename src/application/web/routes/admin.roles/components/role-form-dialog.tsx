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

type Props = {
  mode: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  roleName: string
  roleDescription: string
  onRoleNameChange: (name: string) => void
  onRoleDescriptionChange: (description: string) => void
  onSubmit: () => Promise<void>
}

export default function RoleFormDialog({
  mode,
  open,
  onOpenChange,
  roleName,
  roleDescription,
  onRoleNameChange,
  onRoleDescriptionChange,
  onSubmit,
}: Props) {
  const isCreateMode = mode === 'create'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCreateMode ? 'ロール新規作成' : 'ロール編集'}</DialogTitle>
          <DialogDescription>
            {isCreateMode ? '新しいロールを作成します。' : 'ロール情報を編集します。'}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <Label htmlFor={`${mode}-name`}>ロール名</Label>
            <Input
              id={`${mode}-name`}
              value={roleName}
              onChange={(e) => onRoleNameChange(e.target.value)}
              placeholder='ロール名を入力'
            />
          </div>
          <div>
            <Label htmlFor={`${mode}-description`}>説明</Label>
            <Textarea
              id={`${mode}-description`}
              value={roleDescription}
              onChange={(e) => onRoleDescriptionChange(e.target.value)}
              placeholder='ロールの説明を入力'
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={onSubmit} disabled={!roleName}>
            {isCreateMode ? '作成' : '更新'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
