import { z } from 'zod'
import { createdAt } from '@/common/schemas'

export const skippedArticleSchema = z.object({
  skippedArticleId: z.bigint(),
  activeUserId: z.bigint(),
  articleId: z.bigint(),
  createdAt,
})

export type SkippedArticle = z.infer<typeof skippedArticleSchema>
