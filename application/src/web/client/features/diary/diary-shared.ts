import { isFailure } from '@yuukihayashi0510/core'
import { toTodayJstDateString } from '@/common/locale/date'

type SourceSummary = {
  read: number
  skip: number
}

export function getTodayJst(): string | null {
  const result = toTodayJstDateString()
  if (isFailure(result)) {
    return null
  }
  return result.data
}

export function sumSourceSummary(sources: SourceSummary[]): SourceSummary {
  return sources.reduce(
    (acc, source) => ({
      read: acc.read + source.read,
      skip: acc.skip + source.skip,
    }),
    { read: 0, skip: 0 },
  )
}
