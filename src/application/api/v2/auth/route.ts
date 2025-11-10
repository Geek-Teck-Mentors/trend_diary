import { Hono } from 'hono'
import { Env } from '@/application/env'
import requestLogger from '@/application/middleware/requestLogger'
import zodValidator from '@/application/middleware/zodValidator'
import { authInputSchema } from '@/domain/auth-v2'
import login from './handler/login'
import logout from './handler/logout'
import me from './handler/me'
import signup from './handler/signup'

const app = new Hono<Env>()
  .use(requestLogger)
  .post('/signup', zodValidator('json', authInputSchema), signup)
  .post('/login', zodValidator('json', authInputSchema), login)
  .delete('/logout', logout)
  .get('/me', me)

export default app
