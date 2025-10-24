import { z } from 'zod'
import { createdAt } from '@/common/schemas'

// API用スキーマ
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

// ドメインモデル用スキーマ
export const readHistorySchema = z.object({
  readHistoryId: z.bigint(),
  userId: z.bigint(),
  articleId: z.bigint(),
  readAt: z.date(),
  createdAt,
})

export type CreateReadHistoryApiInput = z.input<typeof createReadHistoryApiSchema>
export type ArticleIdParam = z.output<typeof articleIdParamSchema>
export type ReadHistory = z.infer<typeof readHistorySchema>
