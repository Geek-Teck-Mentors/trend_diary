import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createArticleUseCase } from '@/domain/article'
import { ArticleIdParam } from './readArticle'

export default createApiHandler({
  createUseCase: createArticleUseCase,
  execute: async (useCase, context: RequestContext<ArticleIdParam>) => {
    // requiresAuth: true により、factory.ts内で認証チェック済み
    // context.userは必ず存在するが、型システム上undefinedの可能性があるため型アサーション
    const user = context.user as NonNullable<typeof context.user>
    return useCase.deleteAllReadHistory(user.activeUserId, context.param.article_id)
  },
  transform: () => ({ message: '記事を未読にしました' }),
  logMessage: 'Read history deleted successfully',
  logPayload: (_result, context) => {
    const user = context.user as NonNullable<typeof context.user>
    return {
      activeUserId: user.activeUserId,
      articleId: context.param.article_id,
    }
  },
  statusCode: 200,
  requiresAuth: true,
})
