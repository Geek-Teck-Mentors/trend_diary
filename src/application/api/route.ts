import { Hono } from 'hono';
import { openAPISpecs } from 'hono-openapi';
import accountApp from '@/application/api/account/route';
import { swaggerUI } from '@hono/swagger-ui';

const app = new Hono().route('/account', accountApp);

if (process.env.NODE_ENV === 'development')
  app
    .get(
      '/openapi',
      openAPISpecs(app, {
        documentation: {
          info: {
            title: 'Trend Diary API',
            version: '1.0.0',
            description: 'トレンド記事管理API',
          },
          servers: [
            {
              url: 'http://localhost:5473/api',
              description: 'Development server',
            },
          ],
        },
      }),
    )
    .get('/swagger', swaggerUI({ url: '/api/openapi' }));

export default app;
