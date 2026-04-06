import { Hono } from 'hono'
import { Env } from '@/web/env'
import { authenticator, optionalAuthenticator } from '@/web/middleware/authenticator'
import { defaultRateLimiter } from '@/web/middleware/rate-limiter'
import zodValidator from '@/web/middleware/zod-validator'
import getArticles, { apiArticleQuerySchema } from './handler/get-articles'
import getDiary, { diaryQuerySchema } from './handler/get-diary'
import readArticle, {
  articleIdParamSchema,
  createReadHistoryApiSchema,
} from './handler/read-article'
import skipArticle from './handler/skip-article'
import unreadArticle from './handler/unread-article'
import unreadDigestionArticles, {
  unreadDigestionQuerySchema,
} from './handler/unread-digestion-articles'

const app = new Hono<Env>()
  .get('/', defaultRateLimiter, optionalAuthenticator, zodValidator('query', apiArticleQuerySchema), getArticles)
  .get('/diary', defaultRateLimiter, authenticator, zodValidator('query', diaryQuerySchema), getDiary)
  .get(
    '/unread-digestion',
    defaultRateLimiter,
    authenticator,
    zodValidator('query', unreadDigestionQuerySchema),
    unreadDigestionArticles,
  )
  .post(
    '/:article_id/read',
    defaultRateLimiter,
    authenticator,
    zodValidator('param', articleIdParamSchema),
    zodValidator('json', createReadHistoryApiSchema),
    readArticle,
  )
  .post(
    '/:article_id/skip',
    defaultRateLimiter,
    authenticator,
    zodValidator('param', articleIdParamSchema),
    skipArticle,
  )
  .delete(
    '/:article_id/unread',
    defaultRateLimiter,
    authenticator,
    zodValidator('param', articleIdParamSchema),
    unreadArticle,
  )

export default app
