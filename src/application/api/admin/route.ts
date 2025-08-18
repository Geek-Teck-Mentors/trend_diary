import { Hono } from 'hono'
import { Env } from '@/application/env'
import adminAuth from '@/application/middleware/adminAuth'
import authenticator from '@/application/middleware/authenticator'
import zodValidator from '@/application/middleware/zodValidator'
import getUserList, { querySchema } from './getUserList'
import grantAdminRole, { paramSchema } from './grantAdminRole'

const app = new Hono<Env>()

app
  .get('/users', authenticator, adminAuth, zodValidator('query', querySchema), getUserList)
  .post('/users/:id', authenticator, adminAuth, zodValidator('param', paramSchema), grantAdminRole)

export default app
