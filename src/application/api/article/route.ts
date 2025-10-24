import { Hono } from 'hono'
import { Env } from '@/application/env'
import authMiddleware from '@/application/middleware/authMiddleware'
import zodValidator from '@/application/middleware/zodValidator'
import { articleIdParamSchema, createReadHistoryApiSchema } from '@/domain/article'
import { apiArticleQuerySchema } from '@/domain/article/schema/articleQuerySchema'
import getArticles from './getArticles'
import readArticle from './readArticle'
import unreadArticle from './unreadArticle'

const app = new Hono<Env>()
  .get('/', zodValidator('query', apiArticleQuerySchema), getArticles)
  .post(
    '/:article_id/read',
    authMiddleware,
    zodValidator('param', articleIdParamSchema),
    zodValidator('json', createReadHistoryApiSchema),
    readArticle,
  )
  .delete(
    '/:article_id/unread',
    authMiddleware,
    zodValidator('param', articleIdParamSchema),
    unreadArticle,
  )

export default app
