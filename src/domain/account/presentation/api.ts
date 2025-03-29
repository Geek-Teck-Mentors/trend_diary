import { Hono } from 'hono';
import { Env } from '../../../env';
import signUp from './signUp';

const app = new Hono<Env>().post('/', signUp);

export default app;
