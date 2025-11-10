import { isFailure } from '@yuukihayashi0510/core'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedParamJsonContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { ArticleIdParam, CreateReadHistoryApiInput, createArticleUseCase } from '@/domain/article'
import getRdbClient from '@/infrastructure/rdb'

export default async function readArticle(
  c: ZodValidatedParamJsonContext<ArticleIdParam, CreateReadHistoryApiInput>,
) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const user = c.get(CONTEXT_KEY.SESSION_USER)

  // パスパラメータとリクエストボディの取得
  const param = c.req.valid('param')
  const body = c.req.valid('json')

  const { article_id: articleId } = param
  const { read_at: readAt } = body

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createArticleUseCase(rdb)

  const result = await useCase.createReadHistory(user.activeUserId, articleId, new Date(readAt))
  if (isFailure(result)) throw handleError(result.error, logger)

  logger.info('Read history created successfully', {
    activeUserId: user.activeUserId,
    articleId,
  })

  return c.json({ message: '記事を既読にしました' }, 201)
}
