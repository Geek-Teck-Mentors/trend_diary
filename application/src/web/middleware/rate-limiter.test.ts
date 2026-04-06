import { Hono } from 'hono'
import { Env } from '@/web/env'
import { defaultRateLimiter, strictRateLimiter } from './rate-limiter'

function buildApp(middleware: ReturnType<typeof defaultRateLimiter>) {
  return new Hono<Env>().get('/test', middleware, (c) => c.json({ ok: true }))
}

const BASE_ENV = {
  DATABASE_URL: 'file:./test.db',
  DISCORD_WEBHOOK_URL: '',
  SUPABASE_URL: 'http://127.0.0.1:54321',
  SUPABASE_ANON_KEY: 'dummy',
  LOG_LEVEL: 'silent',
} satisfies Env['Bindings']

describe('defaultRateLimiter', () => {
  it('bindingが未設定の場合はリクエストを通過させる', async () => {
    const app = buildApp(defaultRateLimiter)
    const res = await app.request('/test', {}, BASE_ENV)
    expect(res.status).toBe(200)
  })

  it('bindingがsuccess: trueを返す場合はリクエストを通過させる', async () => {
    const app = buildApp(defaultRateLimiter)
    const env = {
      ...BASE_ENV,
      DEFAULT_RATE_LIMITER: { limit: async () => ({ success: true }) },
    } satisfies Env['Bindings']
    const res = await app.request('/test', {}, env)
    expect(res.status).toBe(200)
  })

  it('bindingがsuccess: falseを返す場合は429を返す', async () => {
    const app = buildApp(defaultRateLimiter)
    const env = {
      ...BASE_ENV,
      DEFAULT_RATE_LIMITER: { limit: async () => ({ success: false }) },
    } satisfies Env['Bindings']
    const res = await app.request('/test', {}, env)
    expect(res.status).toBe(429)
    const body = (await res.json()) as { message: string }
    expect(body.message).toBe('Too Many Requests')
  })
})

describe('strictRateLimiter', () => {
  it('bindingが未設定の場合はリクエストを通過させる', async () => {
    const app = buildApp(strictRateLimiter)
    const res = await app.request('/test', {}, BASE_ENV)
    expect(res.status).toBe(200)
  })

  it('bindingがsuccess: trueを返す場合はリクエストを通過させる', async () => {
    const app = buildApp(strictRateLimiter)
    const env = {
      ...BASE_ENV,
      STRICT_RATE_LIMITER: { limit: async () => ({ success: true }) },
    } satisfies Env['Bindings']
    const res = await app.request('/test', {}, env)
    expect(res.status).toBe(200)
  })

  it('bindingがsuccess: falseを返す場合は429を返す', async () => {
    const app = buildApp(strictRateLimiter)
    const env = {
      ...BASE_ENV,
      STRICT_RATE_LIMITER: { limit: async () => ({ success: false }) },
    } satisfies Env['Bindings']
    const res = await app.request('/test', {}, env)
    expect(res.status).toBe(429)
    const body = (await res.json()) as { message: string }
    expect(body.message).toBe('Too Many Requests')
  })
})
