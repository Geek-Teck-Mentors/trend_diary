import { Hono } from 'jsr:@hono/hono';
import { fetchQiitaFeed, fetchZennFeed } from './fetchFeed.ts';

const functionName = 'fetch_articles';
const app = new Hono().basePath(`/${functionName}`);

app.post('/qiita', async (c) => {
  await fetchQiitaFeed();
  return c.json({ status: 'ok', message: 'Qiita feed fetched successfully' });
});

app.post('/zenn', async (c) => {
  await fetchZennFeed();
  return c.json({ status: 'ok', message: 'Zenn feed fetched successfully' });
});

Deno.serve(app.fetch);
