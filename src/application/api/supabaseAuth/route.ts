import { Hono } from 'hono'
import { Env } from '@/application/env'
import zodValidator from '@/application/middleware/zodValidator'
import { authInputSchema } from '@/domain/supabaseAuth'
import login from './login'
import logout from './logout'
import me from './me'
import signup from './signup'

const app = new Hono<Env>()
  .post('/signup', zodValidator('json', authInputSchema), signup)
  .post('/login', zodValidator('json', authInputSchema), login)
  .delete('/logout', logout)
  .get('/me', me)

export default app
