import { Hono } from 'hono'
import { Env } from '@/application/env'
import { authenticator } from '@/application/middleware/authenticator'
import authorize from '@/application/middleware/authorize'
import zodValidator from '@/application/middleware/zodValidator'
import getUserList, { querySchema } from './handler/getUserList'
import grantAdminRole, { paramSchema } from './handler/grantAdminRole'

const app = new Hono<Env>()
  .get('/users', authenticator, authorize(), zodValidator('query', querySchema), getUserList)
  .post(
    '/users/:id',
    authenticator,
    authorize(),
    zodValidator('param', paramSchema),
    grantAdminRole,
  )

export default app
