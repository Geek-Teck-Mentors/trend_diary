import { HTTPException } from 'hono/http-exception';
import { handleError } from '@/common/errors';
import getRdbClient from '@/infrastructure/rdb';
import {
  createArticleService,
  articleIdParamSchema,
  CreateReadHistoryApiInput,
} from '@/domain/article';
import { isError } from '@/common/types/utility';
import CONTEXT_KEY from '@/application/middleware/context';
import { ZodValidatedContext } from '@/application/middleware/zodValidator';

export default async function readArticle(c: ZodValidatedContext<CreateReadHistoryApiInput>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG);
  const user = c.get(CONTEXT_KEY.SESSION_USER);

  // パスパラメータバリデーション
  const paramResult = articleIdParamSchema.safeParse({
    article_id: c.req.param('article_id'),
  });
  if (!paramResult.success) {
    throw new HTTPException(422, { message: 'Invalid article_id' });
  }

  // リクエストボディバリデーション
  const body = c.req.valid('json');
  const { article_id: articleId } = paramResult.data;
  const { read_at: readAt } = body;

  const rdb = getRdbClient(c.env.DATABASE_URL);
  const service = createArticleService(rdb);

  const result = await service.createReadHistory(user.userId, articleId, new Date(readAt));
  if (isError(result)) throw handleError(result.error, logger);

  logger.info('Read history created successfully', {
    userId: user.userId,
    articleId,
  });

  return c.json({ message: '記事を既読にしました' }, 201);
}
