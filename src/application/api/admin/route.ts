import { Hono } from 'hono'
import { Env } from '@/application/env'
import authenticator from '@/application/middleware/authenticator'
import authorize from '@/application/middleware/authorize'
import zodValidator from '@/application/middleware/zodValidator'
import endpointsRoute from './endpoints/route'
import getUserList, { querySchema } from './handler/getUserList'
import grantAdminRole, { paramSchema } from './handler/grantAdminRole'
import permissionsRoute from './permissions/route'
import rolesRoute from './roles/route'

const app = new Hono<Env>()
  .get('/users', authenticator, authorize(), zodValidator('query', querySchema), getUserList)
  .post(
    '/users/:id',
    authenticator,
    authorize(),
    zodValidator('param', paramSchema),
    grantAdminRole,
  )
  .route('/permissions', permissionsRoute)
  .route('/roles', rolesRoute)
  .route('/endpoints', endpointsRoute)

export default app
