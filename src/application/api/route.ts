import { Hono } from 'hono'
import articleApp from '@/application/api/article/route'
import userApp from '@/application/api/user/route'

const app = new Hono().route('/user', userApp).route('/articles', articleApp)

export default app
