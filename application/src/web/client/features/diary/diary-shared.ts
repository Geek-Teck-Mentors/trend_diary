import { isFailure } from '@yuukihayashi0510/core'
import { toTodayJstDateString } from '@/common/locale/date'

type SourceSummary = {
  read: number
  skip: number
}

export function getTodayJst(): string {
  const result = toTodayJstDateString()
  if (isFailure(result)) {
    // 通常のブラウザ環境では発生しないため、原因を保持して異常系として扱う。
    throw new Error('Failed to resolve JST date', { cause: result.error })
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
