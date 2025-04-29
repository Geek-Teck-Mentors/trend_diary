import { Hono } from 'jsr:@hono/hono';
import { QiitaFetcher, ZennFetcher } from './fetchFeed.ts';

const functionName = 'articles';
const app = new Hono().basePath(`/${functionName}`);

app.post('/articles/:media', async (c) => {
  const media = c.req.param('media');
  switch (media) {
    case 'qiita': {
      const qiitaFetcher = new QiitaFetcher();
      await qiitaFetcher.fetch();
      break;
    }
    case 'zenn': {
      const zennFetcher = new ZennFetcher();
      await zennFetcher.fetch();
      break;
    }
    default: {
      throw new Error('Invalid media type');
    }
  }

  return c.json({ status: 'ok', message: 'Articles fetched successfully' });
})

Deno.serve(app.fetch);
