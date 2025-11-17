import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createArticleUseCase } from '@/domain/article'
import { ArticleIdParam } from './readArticle'

export default createApiHandler({
  createUseCase: createArticleUseCase,
  execute: (useCase, context: RequestContext<ArticleIdParam>) =>
    useCase.deleteAllReadHistory(context.user!.activeUserId, context.param.article_id),
  transform: () => ({ message: '記事を未読にしました' }),
  logMessage: 'Read history deleted successfully',
  logPayload: (_result, context) => ({
    activeUserId: context.user!.activeUserId,
    articleId: context.param.article_id,
  }),
  statusCode: 200,
  requiresAuth: true,
})
