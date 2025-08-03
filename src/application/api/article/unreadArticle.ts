import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedParamContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { ArticleIdParam, createArticleService } from '@/domain/article'
import getRdbClient from '@/infrastructure/rdb'

export default async function unreadArticle(c: ZodValidatedParamContext<ArticleIdParam>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const user = c.get(CONTEXT_KEY.SESSION_USER)

  const param = c.req.valid('param')
  const { article_id: articleId } = param

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const service = createArticleService(rdb)

  const result = await service.deleteAllReadHistory(user.activeUserId, articleId)
  if (isError(result)) throw handleError(result.error, logger)

  logger.info('Read history deleted successfully', {
    activeUserId: user.activeUserId,
    articleId,
  })

  return c.json({ message: '記事を未読にしました' }, 200)
}
