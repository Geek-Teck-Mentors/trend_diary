import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/application/web/components/ui/button'
import { Calendar } from '@/application/web/components/ui/calendar'
import { cn } from '@/application/web/components/ui/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/application/web/components/ui/popover'

type DatePickerProps = {
  date: Date
  onDateChange: (date: Date) => void
  className?: string
}

export function DatePicker({ date, onDateChange, className }: DatePickerProps) {
  const handlePrevDay = () => {
    const prevDay = new Date(date)
    prevDay.setDate(prevDay.getDate() - 1)
    onDateChange(prevDay)
  }

  const handleNextDay = () => {
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    onDateChange(nextDay)
  }

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onDateChange(selectedDate)
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button variant='outline' size='icon' onClick={handlePrevDay} aria-label='前日'>
        <ChevronLeft className='size-4' />
      </Button>
      <Popover>
        <PopoverTrigger asChild={true}>
          <Button
            variant='outline'
            className={cn(
              'w-[280px] justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className='mr-2 size-4' />
            {date ? format(date, 'yyyy年MM月dd日(E)', { locale: ja }) : <span>日付を選択</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={handleSelect}
            initialFocus={true}
            locale={ja}
          />
        </PopoverContent>
      </Popover>
      <Button variant='outline' size='icon' onClick={handleNextDay} aria-label='翌日'>
        <ChevronRight className='size-4' />
      </Button>
    </div>
  )
}
