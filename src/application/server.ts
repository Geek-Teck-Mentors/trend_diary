import { Hono } from 'hono'
import { timeout } from 'hono/timeout'
import { AppLoadContext, createRequestHandler } from 'react-router'
import apiApp from './api/route'
import { Env } from './env'
import errorHandler from './middleware/errorHandler'
import requestLogger from './middleware/requestLogger'

const app = new Hono<Env>()

// requestLoggerは各route.tsで適用されるため、/api以外のパスにのみ適用
app.use('*', async (c, next) => {
  if (c.req.path.startsWith('/api')) {
    return next()
  }
  return requestLogger(c, next)
})
app.onError(errorHandler)

app.use('/api', timeout(5000))
app.route('/api', apiApp)

// hotReload用
if (process.env.NODE_ENV === 'development')
  app.all('*', async (c) => {
    // ビルド結果をhonoにうまく繋ぎこむために使う virtual import
    // @ts-ignore
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
