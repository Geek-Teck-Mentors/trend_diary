import { Hono } from 'hono'
import { Env } from '@/application/env'
import { authenticator } from '@/application/middleware/authenticator'
import authorize from '@/application/middleware/authorize'
import zodValidator from '@/application/middleware/zodValidator'
import createRole, { jsonSchema as createRoleSchema } from './handler/createRole'
import deleteRole, { paramSchema as deleteRoleParamSchema } from './handler/deleteRole'
import getRoleById, { paramSchema as getRoleByIdParamSchema } from './handler/getRoleById'
import getRoles from './handler/getRoles'
import updateRole, {
  paramSchema as updateRoleParamSchema,
  jsonSchema as updateRoleSchema,
} from './handler/updateRole'
import updateRolePermissions, {
  paramSchema as updateRolePermissionsParamSchema,
  jsonSchema as updateRolePermissionsSchema,
} from './handler/updateRolePermissions'

const app = new Hono<Env>()
  .get('/', authenticator, authorize(), getRoles)
  .get(
    '/:id',
    authenticator,
    authorize(),
    zodValidator('param', getRoleByIdParamSchema),
    getRoleById,
  )
  .post('/', authenticator, authorize(), zodValidator('json', createRoleSchema), createRole)
  .patch(
    '/:id',
    authenticator,
    authorize(),
    zodValidator('param', updateRoleParamSchema),
    zodValidator('json', updateRoleSchema),
    updateRole,
  )
  .delete(
    '/:id',
    authenticator,
    authorize(),
    zodValidator('param', deleteRoleParamSchema),
    deleteRole,
  )
  .patch(
    '/:id/permissions',
    authenticator,
    authorize(),
    zodValidator('param', updateRolePermissionsParamSchema),
    zodValidator('json', updateRolePermissionsSchema),
    updateRolePermissions,
  )

export default app
