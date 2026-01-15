import { z } from 'zod'

export const DEFAULT_LIMIT = 20
export const DEFAULT_MOBILE_LIMIT = 10
export const DEFAULT_PAGE = 1

const numericString = z.string().pipe(z.coerce.number())

const clampLimit = (val: number) => Math.min(Math.max(val, 1), 100)

const page = z.union([z.number(), numericString]).optional().default(DEFAULT_PAGE)

const limit = z
  .union([z.number(), numericString])
  .optional()
  .default(DEFAULT_LIMIT)
  .transform(clampLimit)

const mobileLimit = z
  .union([z.number(), numericString])
  .optional()
  .default(DEFAULT_MOBILE_LIMIT)
  .transform(clampLimit)

export const offsetPaginationSchema = z.object({
  page,
  limit,
})

export const offsetPaginationMobileSchema = offsetPaginationSchema.extend({
  limit: mobileLimit,
})

export type OffsetPaginationParams = z.infer<typeof offsetPaginationSchema>
export type OffsetPaginationMobileParams = z.infer<typeof offsetPaginationMobileSchema>
