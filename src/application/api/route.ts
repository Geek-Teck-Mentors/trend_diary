import { Hono } from 'hono';

import accountApp from '@/application/api/account/route';

const app = new Hono().route('/account', accountApp);

export default app;
