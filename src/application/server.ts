import { Hono } from 'hono'
import { timeout } from 'hono/timeout'
import apiApp from './api/route'
import { Env } from './env'
import errorHandler from './middleware/errorHandler'
import loggerMiddleware from './middleware/requestLogger'
import { AppLoadContext, createRequestHandler } from 'react-router'

const app = new Hono<Env>()

app.use(loggerMiddleware)
app.onError(errorHandler)

app.use('/api', timeout(5000))
app.route('/api', apiApp)

// hotReload用
if (process.env.NODE_ENV === 'development')
  app.all('*', async (c) => {
    // ビルド結果をhonoにうまく繋ぎこむために使う virtual import
    // @ts-expect-error it's not typed
    const build = await import('virtual:react-router/server-build')
    const handler = createRequestHandler(build, 'development')
    const remixContext = {
      cloudflare: {
        env: c.env,
      },
    } as unknown as AppLoadContext
    return handler(c.req.raw, remixContext)
  })

export default app
