import { z } from 'zod'

const dateSchema = z.union([z.string().datetime(), z.date()])

export const toJaDateString = (value: string | Date): string => {
  const parseResult = dateSchema.safeParse(value)
  if (!parseResult.success) return ''

  const date = new Date(value)
  return date.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })
}
