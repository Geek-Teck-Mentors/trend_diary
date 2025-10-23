import { Filter } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/application/web/components/ui/dropdown-menu'

type MediaType = 'qiita' | 'zenn' | null

type Props = {
  selectedMedia: MediaType
  onMediaChange: (media: MediaType) => void
}

const mediaLabels: Record<'all' | 'qiita' | 'zenn', string> = {
  all: 'すべて',
  qiita: 'Qiita',
  zenn: 'Zenn',
}

export default function MediaFilter({ selectedMedia, onMediaChange }: Props) {
  const isFilterActive = selectedMedia !== null
  const currentLabel = selectedMedia ? mediaLabels[selectedMedia] : mediaLabels.all

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'
        data-slot='media-filter-trigger'
      >
        <Filter
          className={`w-4 h-4 transition-colors ${isFilterActive ? 'text-blue-600' : 'text-gray-600'}`}
        />
        <span className='text-sm font-medium'>{currentLabel}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuItem onClick={() => onMediaChange(null)} data-slot='media-filter-all'>
          すべて
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMediaChange('qiita')} data-slot='media-filter-qiita'>
          Qiita
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMediaChange('zenn')} data-slot='media-filter-zenn'>
          Zenn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
