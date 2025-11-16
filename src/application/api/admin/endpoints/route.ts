import { Hono } from 'hono'
import { Env } from '@/application/env'
import authenticator from '@/application/middleware/authenticator'
import authorize from '@/application/middleware/authorize'
import zodValidator from '@/application/middleware/zodValidator'
import createEndpoint, { jsonSchema as createEndpointSchema } from './handler/createEndpoint'
import deleteEndpoint, { paramSchema as deleteEndpointParamSchema } from './handler/deleteEndpoint'
import getEndpointById, {
  paramSchema as getEndpointByIdParamSchema,
} from './handler/getEndpointById'
import getEndpoints from './handler/getEndpoints'
import updateEndpointPermissions, {
  paramSchema as updateEndpointPermissionsParamSchema,
  jsonSchema as updateEndpointPermissionsSchema,
} from './handler/updateEndpointPermissions'

const app = new Hono<Env>()
  .get('/', authenticator, authorize(), getEndpoints)
  .get(
    '/:id',
    authenticator,
    authorize(),
    zodValidator('param', getEndpointByIdParamSchema),
    getEndpointById,
  )
  .post('/', authenticator, authorize(), zodValidator('json', createEndpointSchema), createEndpoint)
  .delete(
    '/:id',
    authenticator,
    authorize(),
    zodValidator('param', deleteEndpointParamSchema),
    deleteEndpoint,
  )
  .patch(
    '/:id/permissions',
    authenticator,
    authorize(),
    zodValidator('param', updateEndpointPermissionsParamSchema),
    zodValidator('json', updateEndpointPermissionsSchema),
    updateEndpointPermissions,
  )

export default app
