import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/application/web/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/application/web/components/ui/drawer'

type Props = {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

const WEEKDAYS_JP = ['日', '月', '火', '水', '木', '金', '土']

export default function DatePickerDialog({ isOpen, onClose, selectedDate, onDateSelect }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date(selectedDate)
    date.setDate(1)
    return date
  })

  // 月のカレンダーデータを生成
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // 前月の空白
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }, [currentMonth])

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      newMonth.setMonth(newMonth.getMonth() - 1)
      return newMonth
    })
  }, [])

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      newMonth.setMonth(newMonth.getMonth() + 1)
      return newMonth
    })
  }, [])

  const handleDayClick = useCallback(
    (day: Date) => {
      onDateSelect(day)
    },
    [onDateSelect],
  )

  const isSelectedDate = useCallback(
    (day: Date) => {
      return (
        day.getFullYear() === selectedDate.getFullYear() &&
        day.getMonth() === selectedDate.getMonth() &&
        day.getDate() === selectedDate.getDate()
      )
    },
    [selectedDate],
  )

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>日付を選択</DrawerTitle>
          <DrawerDescription>トレンド記事を表示する日付を選択してください</DrawerDescription>
        </DrawerHeader>
        <div className='px-4 pb-4'>
          {/* 月ナビゲーション */}
          <div className='mb-4 flex items-center justify-between'>
            <Button variant='outline' size='sm' onClick={handlePrevMonth}>
              前月
            </Button>
            <span className='text-lg font-semibold'>
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </span>
            <Button variant='outline' size='sm' onClick={handleNextMonth}>
              翌月
            </Button>
          </div>

          {/* カレンダーグリッド */}
          <div className='grid grid-cols-7 gap-2'>
            {/* 曜日ヘッダー */}
            {WEEKDAYS_JP.map((day) => (
              <div key={day} className='text-center text-sm font-medium text-gray-600'>
                {day}
              </div>
            ))}

            {/* 日付セル */}
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} />
              }

              const isSelected = isSelectedDate(day)
              const isToday =
                day.getFullYear() === new Date().getFullYear() &&
                day.getMonth() === new Date().getMonth() &&
                day.getDate() === new Date().getDate()

              return (
                <button
                  type='button'
                  key={`day-${day.getTime()}`}
                  onClick={() => handleDayClick(day)}
                  className={`rounded-md p-2 text-center text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : isToday
                        ? 'border-2 border-blue-500 hover:bg-gray-100'
                        : 'hover:bg-gray-100'
                  }`}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant='outline'>閉じる</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
