import { Hono } from 'hono'
import articleApp from '@/web/server/article/route'
import authApp from '@/web/server/auth/route'

const app = new Hono().route('/articles', articleApp).route('/auth', authApp)

export default app
