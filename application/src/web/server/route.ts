import { Hono } from 'hono'
import articleApp from '@/web/server/article/route'
import authV2App from '@/web/server/v2/auth/route'

const app = new Hono().route('/articles', articleApp).route('/v2/auth', authV2App)

export default app
