import { Hono } from 'jsr:@hono/hono'
import { fetchQiitaFeed, fetchZennFeed } from './services/fetchFeed.ts'

const functionName = 'fetch_articles'
const app = new Hono().basePath(`/${functionName}`)

app.post('/qiita', async (c) => {
  const articles = await fetchQiitaFeed();
  return c.json(articles);
});

app.post('/zenn', async (c) => {
  const articles = await fetchZennFeed();
  return c.json(articles);
});

Deno.serve(app.fetch);
