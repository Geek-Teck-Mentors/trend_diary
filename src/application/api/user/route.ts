import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import { Env } from '@/application/env'
import authenticator from '@/application/middleware/authenticator'
import zodValidator from '@/application/middleware/zodValidator'
import { activeUserInputSchema } from '@/domain/user'
import login from './login'
import loginUser from './loginUser'
import logout from './logout'
import signup from './signup'

const userFeatureGuard = createMiddleware(async (c, next) => {
  if (c.env.FEATURE_USER_ENABLED !== 'true') {
    return c.json({ message: 'ユーザー機能は現在利用できません' }, 503)
  }
  return next()
})

const app = new Hono<Env>()
  .use(userFeatureGuard)
  .get('/me', authenticator, loginUser)
  .post('/', zodValidator('json', activeUserInputSchema), signup)
  .post(
    '/login',
    zodValidator('json', activeUserInputSchema.pick({ email: true, password: true })),
    login,
  )
  .delete('/logout', authenticator, logout)

export default app
