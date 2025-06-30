import { z } from 'zod'

export const createReadHistoryApiSchema = z.object({
  read_at: z.string().datetime(),
})

export const articleIdParamSchema = z.object({
  article_id: z
    .string()
    .min(1)
    .refine((val) => /^\d+$/.test(val), {
      message: 'article_id must be a valid number',
    })
    .transform((val) => BigInt(val)),
})

export type CreateReadHistoryApiInput = z.input<typeof createReadHistoryApiSchema>
export type ArticleIdParam = z.output<typeof articleIdParamSchema>
