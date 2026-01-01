import { z } from 'zod'

export const DEFAULT_LIMIT = 20
export const DEFAULT_PAGE = 1

function transform(value: string | number | undefined, defaultValue: number) {
  if (value === undefined || value === null) return defaultValue
  const num = typeof value === 'string' ? parseInt(value, 10) : value
  return Number.isNaN(num) ? defaultValue : num
}

const limit = z
  .union([z.string(), z.number()])
  .optional()
  .transform((val) => transform(val, DEFAULT_LIMIT))
  .default(DEFAULT_LIMIT)

export const offsetPaginationSchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => transform(val, DEFAULT_PAGE))
    .default(DEFAULT_PAGE),
  limit,
})

export type OffsetPaginationParams = z.infer<typeof offsetPaginationSchema>
