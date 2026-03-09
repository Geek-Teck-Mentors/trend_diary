import { Hono } from 'hono'
import { authInputSchema } from '@/domain/user'
import { Env } from '@/web/env'
import zodValidator from '@/web/middleware/zod-validator'
import login from './handler/login'
import logout from './handler/logout'
import me from './handler/me'
import signup from './handler/signup'

const app = new Hono<Env>()
  .post('/signup', zodValidator('json', authInputSchema), signup)
  .post('/login', zodValidator('json', authInputSchema), login)
  .delete('/logout', logout)
  .get('/me', me)

export default app
