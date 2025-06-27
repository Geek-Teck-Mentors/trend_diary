import { handleError } from '@/common/errors';
import getRdbClient from '@/infrastructure/rdb';
import { createArticleService, ArticleIdParam } from '@/domain/article';
import { isError } from '@/common/types/utility';
import CONTEXT_KEY from '@/application/middleware/context';
import { ZodValidatedParamContext } from '@/application/middleware/zodValidator';

export default async function unreadArticle(c: ZodValidatedParamContext<ArticleIdParam>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG);
  const user = c.get(CONTEXT_KEY.SESSION_USER);

  const param = c.req.valid('param');
  const { article_id: articleId } = param;

  const rdb = getRdbClient(c.env.DATABASE_URL);
  const service = createArticleService(rdb);

  const result = await service.deleteAllReadHistory(user.userId, articleId);
  if (isError(result)) throw handleError(result.error, logger);

  logger.info('Read history deleted successfully', {
    userId: user.userId,
    articleId,
  });

  return c.json({ message: '記事を未読にしました' }, 200);
}
