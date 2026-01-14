import { Hono } from 'hono'
import { Env } from '@/web/env'
import { authenticator, optionalAuthenticator } from '@/web/middleware/authenticator'
import zodValidator from '@/web/middleware/zod-validator'
import getArticles, { apiArticleQuerySchema } from './handler/get-articles'
import readArticle, {
  articleIdParamSchema,
  createReadHistoryApiSchema,
} from './handler/read-article'
import unreadArticle from './handler/unread-article'

const app = new Hono<Env>()
  .get('/', optionalAuthenticator, zodValidator('query', apiArticleQuerySchema), getArticles)
  .post(
    '/:article_id/read',
    authenticator,
    zodValidator('param', articleIdParamSchema),
    zodValidator('json', createReadHistoryApiSchema),
    readArticle,
  )
  .delete(
    '/:article_id/unread',
    authenticator,
    zodValidator('param', articleIdParamSchema),
    unreadArticle,
  )

export default app
