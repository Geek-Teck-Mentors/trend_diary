import { Hono } from 'hono'
import { Env } from '@/web/env'
import { authenticator, optionalAuthenticator } from '@/web/middleware/authenticator'
import zodValidator from '@/web/middleware/zod-validator'
import getArticles, { apiArticleQuerySchema } from './handler/get-articles'
import getDiary, { diaryQuerySchema } from './handler/get-diary'
import getDiaryRange, { diaryRangeQuerySchema } from './handler/get-diary-range'
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
  .get('/', optionalAuthenticator, zodValidator('query', apiArticleQuerySchema), getArticles)
  .get('/diary', authenticator, zodValidator('query', diaryQuerySchema), getDiary)
  .get('/diary-range', authenticator, zodValidator('query', diaryRangeQuerySchema), getDiaryRange)
  .get(
    '/unread-digestion',
    authenticator,
    zodValidator('query', unreadDigestionQuerySchema),
    unreadDigestionArticles,
  )
  .post(
    '/:article_id/read',
    authenticator,
    zodValidator('param', articleIdParamSchema),
    zodValidator('json', createReadHistoryApiSchema),
    readArticle,
  )
  .post(
    '/:article_id/skip',
    authenticator,
    zodValidator('param', articleIdParamSchema),
    skipArticle,
  )
  .delete(
    '/:article_id/unread',
    authenticator,
    zodValidator('param', articleIdParamSchema),
    unreadArticle,
  )

export default app
