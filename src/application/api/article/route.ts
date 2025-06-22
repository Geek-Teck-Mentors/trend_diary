import { Hono } from 'hono';
import { Env } from '@/application/env';
import zodValidator from '@/application/middleware/zodValidator';
import getArticles from './getArticles';
import { apiArticleQuerySchema } from '@/domain/article/schema/articleQuerySchema';

const app = new Hono<Env>().get('/', zodValidator('query', apiArticleQuerySchema), getArticles);

export default app;
