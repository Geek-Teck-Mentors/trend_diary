import { Hono } from 'hono';
import signup from './signup';
import { accountSchema } from '@/domain/account';
import { Env } from '@/application/env';
import zodValidator from '@/application/middleware/zodValidator';
import login from './login';
import logout from './logout';
import authenticator from '@/application/middleware/authenticator';
import loginUser from './loginUser';

const app = new Hono<Env>()
  .get('/me', authenticator, loginUser)
  .post('/', signup)
  .post('/login', zodValidator('json', accountSchema.pick({ email: true, password: true })), login)
  .delete('/logout', authenticator, logout);

export default app;
