import { z } from 'zod'

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null) return 20
      const num = typeof val === 'string' ? parseInt(val, 10) : val
      return Number.isNaN(num) ? 20 : Math.min(Math.max(num, 1), 100)
    })
    .default(20),
  direction: z.enum(['next', 'prev']).default('next'),
})

export type CursorPaginationParams = z.infer<typeof cursorPaginationSchema>
