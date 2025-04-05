import { Hono } from 'hono';
import accountApp from './domain/account/presentation/route';

const app = new Hono().route('/account', accountApp);

export default app;
