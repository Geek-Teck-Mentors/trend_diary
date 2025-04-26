import { Hono } from 'jsr:@hono/hono'
import { fetchQiitaFeed, fetchZennFeed } from './services/fetchFeed.ts'

const functionName = 'fetch_articles'
const app = new Hono().basePath(`/${functionName}`)

app.post('/', async (c) => {
    const articles = await Promise.all([
        fetchQiitaFeed(),
        fetchZennFeed()
    ]);
    return c.json(articles);
})

Deno.serve(app.fetch)
