import { Hono } from 'hono'
import { Env } from '@/application/env'
import { authenticator } from '@/application/middleware/authenticator'
import authorize from '@/application/middleware/authorize'
import zodValidator from '@/application/middleware/zodValidator'
import createPermission, { jsonSchema as createPermissionSchema } from './handler/createPermission'
import deletePermission, {
  paramSchema as deletePermissionParamSchema,
} from './handler/deletePermission'
import getPermissions from './handler/getPermissions'

const app = new Hono<Env>()
  .get('/', authenticator, authorize(), getPermissions)
  .post(
    '/',
    authenticator,
    authorize(),
    zodValidator('json', createPermissionSchema),
    createPermission,
  )
  .delete(
    '/:id',
    authenticator,
    authorize(),
    zodValidator('param', deletePermissionParamSchema),
    deletePermission,
  )

export default app
