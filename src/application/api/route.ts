import { Hono } from 'hono'
import accountApp from '@/application/api/account/route'
import articleApp from '@/application/api/article/route'

const app = new Hono().route('/account', accountApp).route('/articles', articleApp)

export default app
