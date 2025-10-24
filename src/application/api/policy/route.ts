import { Hono } from 'hono'
import { Env } from '@/application/env'
import authMiddleware from '@/application/middleware/authMiddleware'
import zodValidator from '@/application/middleware/zodValidator'
import { offsetPaginationSchema } from '@/common/pagination'
import {
  privacyPolicyActivateSchema,
  privacyPolicyInputSchema,
  privacyPolicyUpdateSchema,
  versionParamSchema,
} from '@/domain/policy'
import activatePolicy from './activatePolicy'
import clonePolicy from './clonePolicy'
import createPolicy from './createPolicy'
import deletePolicy from './deletePolicy'
import getPolicies from './getPolicies'
import getPolicyByVersion from './getPolicyByVersion'
import updatePolicy from './updatePolicy'

const app = new Hono<Env>()
  .get('/', authMiddleware, zodValidator('query', offsetPaginationSchema), getPolicies)
  .post('/', authMiddleware, zodValidator('json', privacyPolicyInputSchema), createPolicy)
  .get('/:version', authMiddleware, zodValidator('param', versionParamSchema), getPolicyByVersion)
  .patch(
    '/:version',
    authMiddleware,
    zodValidator('param', versionParamSchema),
    zodValidator('json', privacyPolicyUpdateSchema),
    updatePolicy,
  )
  .delete('/:version', authMiddleware, zodValidator('param', versionParamSchema), deletePolicy)
  .post('/:version/clone', authMiddleware, zodValidator('param', versionParamSchema), clonePolicy)
  .patch(
    '/:version/activate',
    authMiddleware,
    zodValidator('param', versionParamSchema),
    zodValidator('json', privacyPolicyActivateSchema),
    activatePolicy,
  )

export default app
