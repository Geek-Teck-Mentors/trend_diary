import { Hono } from 'hono'
import adminApp from '@/application/api/admin/route'
import authApp from '@/application/api/auth/route'

const app = new Hono().route('/auth', authApp).route('/admin', adminApp)

export default app
