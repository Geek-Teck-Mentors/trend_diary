import { Hono } from 'hono'
import TEST_ENV from '@/test/env'
import { Env } from '@/web/env'
import { defaultRateLimiter, strictRateLimiter } from './rate-limiter'

type RateLimiterMiddleware = ReturnType<typeof defaultRateLimiter>

function buildApp(middleware: RateLimiterMiddleware) {
  return new Hono<Env>().get('/test', middleware, (c) => c.json({ ok: true }))
}

describe.each([
  {
    name: 'defaultRateLimiter',
    limiter: defaultRateLimiter,
    binding: 'DEFAULT_RATE_LIMITER' as const,
  },
  {
    name: 'strictRateLimiter',
    limiter: strictRateLimiter,
    binding: 'STRICT_RATE_LIMITER' as const,
  },
])('$name', ({ limiter, binding }) => {
  it('bindingが未設定の場合はリクエストを通過させる', async () => {
    const app = buildApp(limiter)
    const res = await app.request('/test', {}, TEST_ENV)
    expect(res.status).toBe(200)
  })

  it('bindingがsuccess: trueを返す場合はリクエストを通過させる', async () => {
    const app = buildApp(limiter)
    const env = { ...TEST_ENV, [binding]: { limit: async () => ({ success: true }) } }
    const res = await app.request('/test', {}, env)
    expect(res.status).toBe(200)
  })

  it('bindingがsuccess: falseを返す場合は429を返す', async () => {
    const app = buildApp(limiter)
    const env = { ...TEST_ENV, [binding]: { limit: async () => ({ success: false }) } }
    const res = await app.request('/test', {}, env)
    expect(res.status).toBe(429)
    const body = (await res.json()) as { message: string }
    expect(body.message).toBe('Too Many Requests')
  })
})
