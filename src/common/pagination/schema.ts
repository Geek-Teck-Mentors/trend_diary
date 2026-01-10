import { z } from 'zod'

export const DEFAULT_LIMIT = 20
export const DEFAULT_MOBILE_LIMIT = 10
export const DEFAULT_PAGE = 1

function transform(value: string | number | undefined, defaultValue: number) {
  if (value === undefined || value === null) return defaultValue
  const num = typeof value === 'string' ? parseInt(value, 10) : value
  return Number.isNaN(num) ? defaultValue : num
}

const createLimitSchema = (defaultLimit: number = DEFAULT_LIMIT) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      const parsed = transform(val, defaultLimit)
      if (parsed < 1) return 1
      if (parsed > 100) return 100
      return parsed
    })
    .default(defaultLimit)

export const createOffsetPaginationSchema = (defaultLimit: number = DEFAULT_LIMIT) =>
  z.object({
    page: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        const parsed = transform(val, DEFAULT_PAGE)
        return parsed < 1 ? 1 : parsed
      })
      .default(DEFAULT_PAGE),
    limit: createLimitSchema(defaultLimit),
  })

export const offsetPaginationSchema = createOffsetPaginationSchema()

export type OffsetPaginationParams = z.infer<typeof offsetPaginationSchema>
