import { z } from 'zod'

export const DEFAULT_LIMIT = 20
export const DEFAULT_MOBILE_LIMIT = 10
export const DEFAULT_PAGE = 1

function transform(value: string | number | undefined, defaultValue: number) {
  if (value === undefined || value === null) return defaultValue

  const num = typeof value === 'string' ? parseInt(value, 10) : value
  if (Number.isNaN(num)) return defaultValue

  return num < 1 ? 1 : num
}

function transformLimit(value: string | number | undefined, defaultValue: number) {
  const parsed = transform(value, defaultValue)
  if (parsed > 100) return 100
  return parsed
}

const page = z
  .union([z.string(), z.number()])
  .optional()
  .transform((val) => transform(val, DEFAULT_PAGE))
  .default(DEFAULT_PAGE)

const limit = z
  .union([z.string(), z.number()])
  .optional()
  .transform((val) => transformLimit(val, DEFAULT_LIMIT))
  .default(DEFAULT_LIMIT)

const mobileLimit = z
  .union([z.string(), z.number()])
  .optional()
  .transform((val) => transformLimit(val, DEFAULT_MOBILE_LIMIT))
  .default(DEFAULT_MOBILE_LIMIT)

export const offsetPaginationSchema = z.object({
  page,
  limit,
})

export const offsetPaginationMobileSchema = offsetPaginationSchema.extend({
  limit: mobileLimit,
})

export type OffsetPaginationParams = z.infer<typeof offsetPaginationSchema>
export type OffsetPaginationMobileParams = z.infer<typeof offsetPaginationMobileSchema>
