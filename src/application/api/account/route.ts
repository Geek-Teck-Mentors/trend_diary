import { Hono } from 'hono';
import signup from './signup';
import { accountSchema } from '@/domain/account';
import { Env } from '@/application/env';
import zodValidator from '@/application/middleware/zodValidator';
import login from './login';
import logout from './logout';

const app = new Hono<Env>()
  .post('/', signup)
  .post('/login', zodValidator('json', accountSchema.pick({ email: true, password: true })), login)
  .delete('/logout', logout);

export default app;
