import { addDays, format, subDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Matcher } from 'react-day-picker'
import { Button } from '@/application/web/components/ui/button'
import { Calendar } from '@/application/web/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/application/web/components/ui/popover'
import { cn } from '@/application/web/components/ui/lib/utils'

type Props = {
  date: Date
  onDateChange: (date: Date) => void
}

export default function DateSelector({ date, onDateChange }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const currentDate = new Date(date)
  currentDate.setHours(0, 0, 0, 0)

  const isToday = currentDate.getTime() === today.getTime()

  const handlePrevDay = () => {
    onDateChange(subDays(date, 1))
  }

  const handleNextDay = () => {
    if (!isToday) {
      onDateChange(addDays(date, 1))
    }
  }

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onDateChange(selectedDate)
    }
  }

  const disabledMatcher: Matcher = (day: Date) => {
    const checkDate = new Date(day)
    checkDate.setHours(0, 0, 0, 0)
    return checkDate.getTime() > today.getTime()
  }

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='icon'
        onClick={handlePrevDay}
        className='h-8 w-8'
        aria-label='前日'
      >
        <ChevronLeft className='h-4 w-4' />
      </Button>

      <Popover>
        <PopoverTrigger asChild={true}>
          <Button
            variant='outline'
            className={cn('justify-start text-left font-normal', !date && 'text-muted-foreground')}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {date ? format(date, 'PPP', { locale: ja }) : '日付を選択'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={handleCalendarSelect}
            disabled={disabledMatcher}
            initialFocus={true}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant='outline'
        size='icon'
        onClick={handleNextDay}
        disabled={isToday}
        className='h-8 w-8'
        aria-label='翌日'
      >
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  )
}
