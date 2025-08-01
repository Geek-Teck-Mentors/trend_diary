import { Hono } from 'hono'
import { Env } from '@/application/env'
import authenticator from '@/application/middleware/authenticator'
import zodValidator from '@/application/middleware/zodValidator'
import { accountSchema } from '@/domain/account'
import login from './login'
import loginUser from './loginUser'
import logout from './logout'
import signup from './signup'

const app = new Hono<Env>()
  .get('/me', authenticator, loginUser)
  .post('/', zodValidator('json', accountSchema.pick({ email: true, password: true })), signup)
  .post('/login', zodValidator('json', accountSchema.pick({ email: true, password: true })), login)
  .delete('/logout', authenticator, logout)

export default app
