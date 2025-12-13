import { Hono } from 'hono'
import articleApp from '@/application/api/article/route'
import rolesApp from '@/application/api/roles/route'
import userApp from '@/application/api/user/route'
import authV2App from '@/application/api/v2/auth/route'

const app = new Hono()
  .route('/user', userApp)
  .route('/articles', articleApp)
  .route('/roles', rolesApp)
  .route('/v2/auth', authV2App)

export default app
