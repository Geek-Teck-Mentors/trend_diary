import { Hono } from 'hono';
import signUp from './signUp';

const app = new Hono().post('/', signUp);

export default app;
