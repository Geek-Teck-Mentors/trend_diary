import type { AppLoadContext } from '@remix-run/cloudflare';
import { createRequestHandler } from '@remix-run/cloudflare';
import { Hono } from 'hono';
import { timeout } from 'hono/timeout';
import { cors } from 'hono/cors';
import loggerMiddleware from './middleware/requestLogger';
import errorHandler from './middleware/errorHandler';
import { Env } from './env';
import apiApp from './api/route';

const app = new Hono<Env>();

app.use(loggerMiddleware);
app.onError(errorHandler);

app.use(
  '/api/*',
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);
app.use('/api', timeout(5000));
app.route('/api', apiApp);

if (process.env.NODE_ENV === 'development')
  app.all('*', async (c) => {
    // remixのビルド結果をhonoにうまく繋ぎこむために使う virtual import
    // @ts-expect-error it's not typed
    const build = await import('virtual:remix/server-build');
    const handler = createRequestHandler(build, 'development');
    const remixContext = {
      cloudflare: {
        env: c.env,
      },
    } as unknown as AppLoadContext;
    return handler(c.req.raw, remixContext);
  });

export default app;
