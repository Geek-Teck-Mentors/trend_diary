import { Hono } from 'hono'
import { Env } from '@/application/env'
import authenticator from '@/application/middleware/authenticator'
import zodValidator from '@/application/middleware/zodValidator'
import { offsetPaginationSchema } from '@/common/pagination'
import { privacyPolicyInputSchema, versionParamSchema } from '@/domain/policy'
import createPolicy from './createPolicy'
import getPolicies from './getPolicies'
import getPolicyByVersion from './getPolicyByVersion'

const app = new Hono<Env>()
  .get('/', authenticator, zodValidator('query', offsetPaginationSchema), getPolicies)
  .post('/', authenticator, zodValidator('json', privacyPolicyInputSchema), createPolicy)
  .get('/:version', authenticator, zodValidator('param', versionParamSchema), getPolicyByVersion)

export default app
