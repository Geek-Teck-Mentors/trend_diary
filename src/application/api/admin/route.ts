import { Hono } from 'hono'
import { Env } from '@/application/env'
import authenticator from '@/application/middleware/authenticator'
import requestLogger from '@/application/middleware/requestLogger'
import requiredAdmin from '@/application/middleware/requiredAdmin'
import zodValidator from '@/application/middleware/zodValidator'
import getUserList, { querySchema } from './handler/getUserList'
import grantAdminRole, { paramSchema } from './handler/grantAdminRole'

// TODO: 変更の影響範囲がフロントに及んでいるので治す
const app = new Hono<Env>()
  .use(requestLogger)
  .get('/users', authenticator, requiredAdmin, zodValidator('query', querySchema), getUserList)
  .post(
    '/users/:id',
    authenticator,
    requiredAdmin,
    zodValidator('param', paramSchema),
    grantAdminRole,
  )

export default app
