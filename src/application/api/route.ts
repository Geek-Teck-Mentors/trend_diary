import { Hono } from 'hono'
import articleApp from '@/application/api/article/route'
import authV2App from '@/application/api/v2/auth/route'

const app = new Hono().route('/articles', articleApp).route('/v2/auth', authV2App)

export default app
