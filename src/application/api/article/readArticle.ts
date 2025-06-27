import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { handleError } from '@/common/errors';
import getRdbClient from '@/infrastructure/rdb';
import {
  createArticleService,
  createReadHistoryApiSchema,
  articleIdParamSchema,
} from '@/domain/article';
import { isError } from '@/common/types/utility';
import CONTEXT_KEY from '@/application/middleware/context';
import { Env } from '@/application/env';
import User from '@/domain/account/model/user';

export default async function readArticle(c: Context<Env>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG);

  // 認証チェック
  const user = c.get(CONTEXT_KEY.SESSION_USER) as User | null;
  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  // パスパラメータバリデーション
  const paramResult = articleIdParamSchema.safeParse({
    article_id: c.req.param('article_id'),
  });
  if (!paramResult.success) {
    throw new HTTPException(400, { message: 'Invalid article_id' });
  }

  // リクエストボディバリデーション
  const body = await c.req.json();
  const bodyResult = createReadHistoryApiSchema.safeParse(body);
  if (!bodyResult.success) {
    throw new HTTPException(400, { message: 'Invalid request body' });
  }

  const { article_id: articleId } = paramResult.data;
  const { readAt } = bodyResult.data;

  const rdb = getRdbClient(c.env.DATABASE_URL);
  const service = createArticleService(rdb);

  const result = await service.createReadHistory(user.userId, articleId, new Date(readAt));

  if (isError(result)) {
    throw handleError(result.error, logger);
  }

  logger.info('Read history created successfully', {
    userId: user.userId,
    articleId,
  });

  return c.json({ message: '記事を既読にしました' }, 201);
}
