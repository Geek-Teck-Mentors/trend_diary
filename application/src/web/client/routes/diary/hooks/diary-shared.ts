import { isFailure } from '@yuukihayashi0510/core'
import { toJstDateString } from '@/common/locale/date'

type SourceSummary = {
  read: number
  skip: number
}

export function getTodayJst(): string {
  const result = toJstDateString(new Date())
  if (isFailure(result)) {
    return new Date().toISOString().slice(0, 10)
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
