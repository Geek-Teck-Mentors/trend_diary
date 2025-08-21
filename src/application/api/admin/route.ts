import { Hono } from 'hono'
import { Env } from '@/application/env'
import authenticator from '@/application/middleware/authenticator'
import requiredAdmin from '@/application/middleware/requiredAdmin'
import zodValidator from '@/application/middleware/zodValidator'
import getUserList, { querySchema } from './getUserList'
import grantAdminRole, { paramSchema } from './grantAdminRole'

const app = new Hono<Env>()
  .get('/users', authenticator, requiredAdmin, zodValidator('query', querySchema), getUserList)
  .post(
    '/users/:id',
    authenticator,
    requiredAdmin,
    zodValidator('param', paramSchema),
    grantAdminRole,
  )

export default app
