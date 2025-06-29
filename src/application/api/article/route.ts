import { Hono } from 'hono'
import { Env } from '@/application/env'
import zodValidator from '@/application/middleware/zodValidator'
import { apiArticleQuerySchema } from '@/domain/article/schema/articleQuerySchema'
import getArticles from './getArticles'

const app = new Hono<Env>().get('/', zodValidator('query', apiArticleQuerySchema), getArticles)

export default app
