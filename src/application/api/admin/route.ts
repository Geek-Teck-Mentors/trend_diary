import { Hono } from 'hono'
import { Env } from '@/application/env'
import authMiddleware from '@/application/middleware/authMiddleware'
import requiredAdmin from '@/application/middleware/requiredAdmin'
import zodValidator from '@/application/middleware/zodValidator'
import getUserList, { querySchema } from './getUserList'
import grantAdminRole, { paramSchema } from './grantAdminRole'

const app = new Hono<Env>()
  .get('/users', authMiddleware, requiredAdmin, zodValidator('query', querySchema), getUserList)
  .post(
    '/users/:id',
    authMiddleware,
    requiredAdmin,
    zodValidator('param', paramSchema),
    grantAdminRole,
  )

export default app
