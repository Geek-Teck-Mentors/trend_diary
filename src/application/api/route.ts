import { Hono } from 'hono';
import { cors } from 'hono/cors';
import accountApp from '@/application/api/account/route';

const app = new Hono().route('/account', accountApp);
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['POST', 'GET', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

export default app;
