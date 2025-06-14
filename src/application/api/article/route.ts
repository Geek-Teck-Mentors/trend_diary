import { Hono } from 'hono';
import { articleQuerySchema } from '@/domain/article/schema/articleQuerySchema';
import { Env } from '@/application/env';
import zodValidator from '@/application/middleware/zodValidator';
import getArticles from './getArticles';

const app = new Hono<Env>().get('/', zodValidator('query', articleQuerySchema), getArticles);

export default app;
