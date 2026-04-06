import { Hono } from 'hono'
import { authInputSchema } from '@/domain/user'
import { Env } from '@/web/env'
import { authenticator } from '@/web/middleware/authenticator'
import { defaultRateLimiter, strictRateLimiter } from '@/web/middleware/rate-limiter'
import zodValidator from '@/web/middleware/zod-validator'
import login from './handler/login'
import logout from './handler/logout'
import me from './handler/me'
import signup from './handler/signup'

const app = new Hono<Env>()
  .post('/signup', strictRateLimiter, zodValidator('json', authInputSchema), signup)
  .post('/login', strictRateLimiter, zodValidator('json', authInputSchema), login)
  .delete('/logout', defaultRateLimiter, logout)
  .get('/me', defaultRateLimiter, authenticator, me)

export default app
