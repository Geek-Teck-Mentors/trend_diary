import { Hono } from 'hono'
import { Env } from '@/application/env'
import authenticator from '@/application/middleware/authenticator'
import zodValidator from '@/application/middleware/zodValidator'
import { privacyPolicyInputSchema, versionParamSchema } from '@/domain/policy'
import createPolicy from './createPolicy'
import getPolicyByVersion from './getPolicyByVersion'

const app = new Hono<Env>()
  .post('/', authenticator, zodValidator('json', privacyPolicyInputSchema), createPolicy)
  .get('/:version', authenticator, zodValidator('param', versionParamSchema), getPolicyByVersion)

export default app
