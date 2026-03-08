import { isFailure } from '@yuukihayashi0510/core'
import { HTTPException } from 'hono/http-exception'
import { toJstDate, toJstDateString } from '@/common/locale/date'

export const DATE_STRING_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function resolveTodayJst(): string {
  const todayResult = toJstDateString(new Date())
  if (isFailure(todayResult)) {
    throw new HTTPException(500, { message: 'Failed to resolve JST date' })
  }
  return todayResult.data
}

export function ensureValidDiaryDate(inputDate: string): string {
  const parsed = toJstDate(inputDate)
  if (Number.isNaN(parsed.getTime())) {
    throwInvalidDateError()
  }

  const normalized = toJstDateString(parsed)
  if (isFailure(normalized) || normalized.data !== inputDate) {
    throwInvalidDateError()
  }

  return inputDate
}

function throwInvalidDateError(): never {
  throw new HTTPException(422, {
    message: 'Invalid input',
    cause: {
      date: ['date must be a valid JST date'],
    },
  })
}
