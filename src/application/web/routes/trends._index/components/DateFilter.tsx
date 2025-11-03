import { useCallback, useRef } from 'react'
import { ArrowBigLeft, ArrowBigRight } from 'lucide-react'
import { Button } from '@/application/web/components/ui/button'
import { toJaDateString } from '@/common/locale'

type Props = {
  date: Date
  onDateChange: (date: Date) => void
}

export default function DateFilter({ date, onDateChange }: Props) {
  const dateInputRef = useRef<HTMLInputElement>(null)

  const handlePrevDay = useCallback(() => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() - 1)
    onDateChange(newDate)
  }, [date, onDateChange])

  const handleNextDay = useCallback(() => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + 1)
    onDateChange(newDate)
  }, [date, onDateChange])

  const handleDateClick = useCallback(() => {
    dateInputRef.current?.showPicker()
  }, [])

  const handleDateInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = new Date(e.target.value)
      if (!Number.isNaN(newDate.getTime())) {
        onDateChange(newDate)
      }
    },
    [onDateChange],
  )

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='icon'
        onClick={handlePrevDay}
        aria-label='前の日'
      >
        <ArrowBigLeft className='h-4 w-4' />
      </Button>

      <button
        type='button'
        onClick={handleDateClick}
        className='cursor-pointer text-xl italic hover:text-primary transition-colors'
      >
        - {toJaDateString(date)} -
      </button>

      <input
        ref={dateInputRef}
        type='date'
        value={formatDateForInput(date)}
        onChange={handleDateInputChange}
        className='hidden'
        aria-label='日付を選択'
      />

      <Button
        variant='outline'
        size='icon'
        onClick={handleNextDay}
        aria-label='次の日'
      >
        <ArrowBigRight className='h-4 w-4' />
      </Button>
    </div>
  )
}
