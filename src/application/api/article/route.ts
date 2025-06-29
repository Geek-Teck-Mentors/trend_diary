import { Hono } from 'hono';
import { Env } from '@/application/env';
import zodValidator from '@/application/middleware/zodValidator';
import authenticator from '@/application/middleware/authenticator';
import getArticles from './getArticles';
import readArticle from './readArticle';
import unreadArticle from './unreadArticle';
import { apiArticleQuerySchema } from '@/domain/article/schema/articleQuerySchema';
import { articleIdParamSchema, createReadHistoryApiSchema } from '@/domain/article';

const app = new Hono<Env>()
  .get('/', zodValidator('query', apiArticleQuerySchema), getArticles)
  .post(
    '/:article_id/read',
    authenticator,
    zodValidator('json', createReadHistoryApiSchema),
    readArticle,
  )
  .delete(
    '/:article_id/unread',
    authenticator,
    zodValidator('param', articleIdParamSchema),
    unreadArticle,
  );

export default app
