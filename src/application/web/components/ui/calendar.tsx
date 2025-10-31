import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import type { DayPickerProps } from 'react-day-picker'
import { format } from 'date-fns'
import type { Locale } from 'date-fns'
import { ja } from 'date-fns/locale'

import { cn } from '@/application/web/components/ui/lib/utils'
import { buttonVariants } from '@/application/web/components/ui/button'

export type CalendarProps = DayPickerProps

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const formatCaption = (date: Date, options?: { locale?: Locale }): string => {
    const y = format(date, 'yyyy')
    const m = format(date, 'MM', { locale: options?.locale })
    return `${y}年${m}月`
  }

  return (
    <DayPicker
      locale={ja}
      formatters={{ formatCaption }}
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        month_caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        day: cn(
          'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        ),
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
        ),
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        outside: 'text-muted-foreground opacity-50',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'bg-accent text-accent-foreground',
        weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        weekdays: 'flex',
        month: 'space-y-4',
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        nav: 'space-x-1 flex items-center',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1',
        ),
        week: 'flex w-full mt-2',
        month_grid: 'w-full border-collapse space-y-1',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') {
            return <ChevronLeft className='h-4 w-4' />
          }
          return <ChevronRight className='h-4 w-4' />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
