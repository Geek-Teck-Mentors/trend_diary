import { Hono } from 'hono'
import { Env } from '@/application/env'
import authenticator from '@/application/middleware/authenticator'
import requiredAdmin from '@/application/middleware/requiredAdmin'
import zodValidator from '@/application/middleware/zodValidator'
import endpointsRoute from './endpoints/route'
import getUserList, { querySchema } from './handler/getUserList'
import grantAdminRole, { paramSchema } from './handler/grantAdminRole'
import permissionsRoute from './permissions/route'
import rolesRoute from './roles/route'

// TODO: 変更の影響範囲がフロントに及んでいるので治す
const app = new Hono<Env>()
  .get('/users', authenticator, requiredAdmin, zodValidator('query', querySchema), getUserList)
  .post(
    '/users/:id',
    authenticator,
    requiredAdmin,
    zodValidator('param', paramSchema),
    grantAdminRole,
  )
  .route('/permissions', permissionsRoute)
  .route('/roles', rolesRoute)
  .route('/endpoints', endpointsRoute)

export default app
