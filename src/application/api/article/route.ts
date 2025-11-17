import { Hono } from 'hono'
import { Env } from '@/application/env'
import authenticator from '@/application/middleware/authenticator'
import errorHandler from '@/application/middleware/errorHandler'
import requestLogger from '@/application/middleware/requestLogger'
import zodValidator from '@/application/middleware/zodValidator'
import getArticles, { apiArticleQuerySchema } from './handler/getArticles'
import readArticle, {
  articleIdParamSchema,
  createReadHistoryApiSchema,
} from './handler/readArticle'
import unreadArticle from './handler/unreadArticle'

const app = new Hono<Env>()

app.use(requestLogger)
app.onError(errorHandler)

app
  .get('/', zodValidator('query', apiArticleQuerySchema), getArticles)
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
