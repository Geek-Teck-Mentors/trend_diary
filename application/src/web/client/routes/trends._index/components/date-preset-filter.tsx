import { Button } from '@/web/client/components/shadcn/button'
import { cn } from '@/web/client/components/shadcn/lib/utils'
import type { DatePresetType } from '../hooks/use-articles'

type Props = {
  selectedDatePreset: DatePresetType
  onDatePresetChange: (datePreset: DatePresetType) => void
}

const datePresetOptions = [
  { value: 'today', label: '今日', dataSlot: 'date-preset-filter-today' },
  { value: 'last3days', label: '過去3日', dataSlot: 'date-preset-filter-last3days' },
  { value: 'last7days', label: '過去7日', dataSlot: 'date-preset-filter-last7days' },
] as const satisfies ReadonlyArray<{
  value: DatePresetType
  label: string
  dataSlot: string
}>

export default function DatePresetFilter({ selectedDatePreset, onDatePresetChange }: Props) {
  return (
    <div className='flex flex-wrap items-center gap-2' data-slot='date-preset-filter'>
      {datePresetOptions.map((option) => {
        const isSelected = selectedDatePreset === option.value
        return (
          <Button
            key={option.dataSlot}
            type='button'
            variant='outline'
            className={cn(
              'border-gray-300 text-gray-700 hover:bg-gray-100',
              isSelected && 'border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100',
            )}
            onClick={() => onDatePresetChange(option.value)}
            data-slot={option.dataSlot}
          >
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}
