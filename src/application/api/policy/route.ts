import { Hono } from 'hono'
import { Env } from '@/application/env'
import authenticator from '@/application/middleware/authenticator'
import zodValidator from '@/application/middleware/zodValidator'
import { privacyPolicyInputSchema } from '@/domain/policy'
import createPolicy from './createPolicy'

const app = new Hono<Env>().post(
  '/',
  authenticator,
  zodValidator('json', privacyPolicyInputSchema),
  createPolicy,
)

export default app
