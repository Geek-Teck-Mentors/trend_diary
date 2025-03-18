import type { AppLoadContext } from '@remix-run/cloudflare';
import { createRequestHandler } from '@remix-run/cloudflare';
import { Hono } from 'hono';
import { timeout } from 'hono/timeout';
import loggerMiddleware from './middleware/requestLogger';
import errorHandler from './middleware/errorHandler';
import { Env } from './env';
import apiApp from './api.route';
import getRdbClient from './infrastructure/rdb';

const app = new Hono<Env>();

app.use(loggerMiddleware);
app.onError(errorHandler);

app.use('/api', timeout(5000));
app.route('/api', apiApp);

// TODO: Prisma DBのUserモデルを作成test用。これが終われば削除する
app.post('/api/user', async (c) => {
  const db = getRdbClient(c.env.DATABASE_URL);
  const user = await db.user.create({
    data: {
      userId: `user_id_test_${Math.random()}`,
      accountId: 'test',
      displayName: 'test',
    },
  });
  return c.json(user);
});

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
