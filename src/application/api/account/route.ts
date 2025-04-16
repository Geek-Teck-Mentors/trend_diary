import { Hono } from 'hono';
import signup from './signup';

const app = new Hono().post('/', signup);

export default app;
