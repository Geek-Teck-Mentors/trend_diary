import { z } from 'zod'
import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createArticleUseCase } from '@/domain/article'

// API用スキーマ
export const createReadHistoryApiSchema = z.object({
  read_at: z.string().datetime(),
})

export const articleIdParamSchema = z.object({
  article_id: z
    .string()
    .min(1)
    .regex(/^\d+$/, { message: 'article_id must be a valid number' })
    .transform((val) => BigInt(val)),
})

export type CreateReadHistoryApiInput = z.input<typeof createReadHistoryApiSchema>
export type ArticleIdParam = z.output<typeof articleIdParamSchema>

export default createApiHandler({
  createUseCase: createArticleUseCase,
  execute: async (useCase, context: RequestContext<ArticleIdParam, CreateReadHistoryApiInput>) => {
    // requiresAuth: true により、factory.ts内で認証チェック済み
    // context.userは必ず存在するが、型システム上undefinedの可能性があるため型アサーション
    const user = context.user as NonNullable<typeof context.user>
    return useCase.createReadHistory(
      user.activeUserId,
      context.param.article_id,
      new Date(context.json.read_at),
    )
  },
  transform: () => ({ message: '記事を既読にしました' }),
  logMessage: 'Read history created successfully',
  logPayload: (_result, context) => {
    const user = context.user as NonNullable<typeof context.user>
    return {
      activeUserId: user.activeUserId,
      articleId: context.param.article_id,
    }
  },
  statusCode: 201,
  requiresAuth: true,
})
