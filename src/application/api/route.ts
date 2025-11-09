import { Hono } from 'hono'
import adminApp from '@/application/api/admin/route'
import articleApp from '@/application/api/article/route'
import policyApp from '@/application/api/policy/route'
import userApp from '@/application/api/user/route'
import authV2App from '@/application/api/v2/auth/route'

const app = new Hono()
  .route('/user', userApp)
  .route('/articles', articleApp)
  .route('/policies', policyApp)
  .route('/admin', adminApp)
  .route('/v2/auth', authV2App)

export default app
