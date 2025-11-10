import * as React from 'react'
import { Button } from '@/application/web/components/shadcn/button'
import { Input } from '@/application/web/components/shadcn/input'
import { Label } from '@/application/web/components/shadcn/label'

type Props = {
  searchQuery: string
  onSearchChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  onClear: () => void
}

export default function SearchForm({ searchQuery, onSearchChange, onSubmit, onClear }: Props) {
  return (
    <form onSubmit={onSubmit} className='flex gap-4'>
      <div className='flex-1'>
        <Label htmlFor='search' className='sr-only'>
          ユーザー検索
        </Label>
        <Input
          id='search'
          placeholder='メールアドレスまたは表示名で検索'
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Button type='submit' variant='default'>
        検索
      </Button>

      <Button type='button' variant='outline' onClick={onClear} disabled={!searchQuery}>
        クリア
      </Button>
    </form>
  )
}
