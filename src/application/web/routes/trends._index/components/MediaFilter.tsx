import { Filter } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/application/web/components/ui/dropdown-menu'
import { cn } from '@/application/web/components/ui/lib/utils'
import type { MediaType } from '../useTrends'

type Props = {
  selectedMedia: MediaType
  onMediaChange: (media: MediaType) => void
}

const mediaOptions = [
  { value: null, label: 'すべて', dataSlot: 'media-filter-all' },
  { value: 'qiita', label: 'Qiita', dataSlot: 'media-filter-qiita' },
  { value: 'zenn', label: 'Zenn', dataSlot: 'media-filter-zenn' },
] as const

export default function MediaFilter({ selectedMedia, onMediaChange }: Props) {
  const isFilterActive = selectedMedia !== null
  const currentLabel =
    mediaOptions.find((option) => option.value === selectedMedia)?.label || mediaOptions[0].label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'
        data-slot='media-filter-trigger'
      >
        <Filter
          className={cn(
            'w-4 h-4 transition-colors',
            isFilterActive ? 'text-blue-600' : 'text-gray-600',
          )}
        />
        <span className='text-sm font-medium'>{currentLabel}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        {mediaOptions.map((option) => (
          <DropdownMenuItem
            key={option.dataSlot}
            onClick={() => onMediaChange(option.value as MediaType)}
            data-slot={option.dataSlot}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
