import { Hono } from 'hono'
import { Env } from '@/application/env'
import authenticator from '@/application/middleware/authenticator'
import errorHandler from '@/application/middleware/errorHandler'
import requestLogger from '@/application/middleware/requestLogger'
import zodValidator from '@/application/middleware/zodValidator'
import { offsetPaginationSchema } from '@/common/pagination'
import {
  privacyPolicyActivateSchema,
  privacyPolicyInputSchema,
  privacyPolicyUpdateSchema,
  versionParamSchema,
} from '@/domain/policy'
import activatePolicy from './handler/activatePolicy'
import clonePolicy from './handler/clonePolicy'
import createPolicy from './handler/createPolicy'
import deletePolicy from './handler/deletePolicy'
import getPolicies from './handler/getPolicies'
import getPolicyByVersion from './handler/getPolicyByVersion'
import updatePolicy from './handler/updatePolicy'

const app = new Hono<Env>()
  .use(requestLogger)
  .get('/', authenticator, zodValidator('query', offsetPaginationSchema), getPolicies)
  .post('/', authenticator, zodValidator('json', privacyPolicyInputSchema), createPolicy)
  .get('/:version', authenticator, zodValidator('param', versionParamSchema), getPolicyByVersion)
  .patch(
    '/:version',
    authenticator,
    zodValidator('param', versionParamSchema),
    zodValidator('json', privacyPolicyUpdateSchema),
    updatePolicy,
  )
  .delete('/:version', authenticator, zodValidator('param', versionParamSchema), deletePolicy)
  .post('/:version/clone', authenticator, zodValidator('param', versionParamSchema), clonePolicy)
  .patch(
    '/:version/activate',
    authenticator,
    zodValidator('param', versionParamSchema),
    zodValidator('json', privacyPolicyActivateSchema),
    activatePolicy,
  )

app.onError(errorHandler)

export default app
