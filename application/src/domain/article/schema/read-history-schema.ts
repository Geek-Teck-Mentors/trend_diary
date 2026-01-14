import { z } from 'zod'
import { createdAt } from '@/common/schemas'

// ドメインモデル用スキーマ
export const readHistorySchema = z.object({
  readHistoryId: z.bigint(),
  activeUserId: z.bigint(),
  articleId: z.bigint(),
  readAt: z.date(),
  createdAt,
})

export type ReadHistory = z.infer<typeof readHistorySchema>
