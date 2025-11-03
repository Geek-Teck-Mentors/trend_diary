import { ArrowBigLeft, ArrowBigRight } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '@/application/web/components/ui/button'
import { toJaDateString } from '@/common/locale'
import DatePickerDialog from './DatePickerDialog'

type Props = {
  date: Date
  onDateChange: (date: Date) => void
}

export default function DateNavigator({ date, onDateChange }: Props) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const handlePrevDay = useCallback(() => {
    const prevDay = new Date(date)
    prevDay.setDate(prevDay.getDate() - 1)
    onDateChange(prevDay)
  }, [date, onDateChange])

  const handleNextDay = useCallback(() => {
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    onDateChange(nextDay)
  }, [date, onDateChange])

  const handleDateSelect = useCallback(
    (selectedDate: Date) => {
      onDateChange(selectedDate)
      setIsPickerOpen(false)
    },
    [onDateChange],
  )

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='ghost'
        size='icon'
        onClick={handlePrevDay}
        aria-label='前日'
        className='h-8 w-8'
      >
        <ArrowBigLeft className='h-5 w-5' />
      </Button>
      <button
        type='button'
        onClick={() => setIsPickerOpen(true)}
        className='cursor-pointer text-xl italic hover:underline'
      >
        - {toJaDateString(date)} -
      </button>
      <Button
        variant='ghost'
        size='icon'
        onClick={handleNextDay}
        aria-label='翌日'
        className='h-8 w-8'
      >
        <ArrowBigRight className='h-5 w-5' />
      </Button>
      <DatePickerDialog
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedDate={date}
        onDateSelect={handleDateSelect}
      />
    </div>
  )
}
