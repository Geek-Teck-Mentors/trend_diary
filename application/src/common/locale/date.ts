import { z } from 'zod'

const dateSchema = z.union([z.string().datetime(), z.date()])
const jstDateFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const getJstDateParts = (rawDate: Date) => {
  if (Number.isNaN(rawDate.getTime())) {
    throw new Error('無効な日付です')
  }

  const jstParts = jstDateFormatter.formatToParts(rawDate)
  const year = jstParts.find((part) => part.type === 'year')?.value
  const month = jstParts.find((part) => part.type === 'month')?.value
  const day = jstParts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new Error('JST日付の取得に失敗しました')
  }

  return { year, month, day }
}

export const toJstDateString = (rawDate: Date): string => {
  const { year, month, day } = getJstDateParts(rawDate)
  return `${year}-${month}-${day}`
}

export const addJstDays = (baseDateString: string, days: number): string => {
  const baseDate = new Date(`${baseDateString}T00:00:00+09:00`)
  if (Number.isNaN(baseDate.getTime())) {
    throw new Error(`不正な日付文字列です: ${baseDateString}`)
  }

  baseDate.setUTCDate(baseDate.getUTCDate() + days)
  return toJstDateString(baseDate)
}

export const toJaDateString = (value: string | Date): string => {
  const parseResult = dateSchema.safeParse(value)
  if (!parseResult.success) return ''

  const date = new Date(value)
  return date.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })
}
