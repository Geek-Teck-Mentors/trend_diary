import { Hono } from 'hono'
import userApp from '@/application/api/user/route'
import articleApp from '@/application/api/article/route'

const app = new Hono().route('/user', userApp).route('/articles', articleApp)

export default app
