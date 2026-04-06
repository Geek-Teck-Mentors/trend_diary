import { Hono } from 'hono'
import TEST_ENV from '@/test/env'
import { Env } from '@/web/env'
import { defaultRateLimiter, strictRateLimiter } from './rate-limiter'

type RateLimiterMiddleware = typeof defaultRateLimiter

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
    const res = await app.request('/test', { headers: { 'CF-Connecting-IP': '1.2.3.4' } }, env)
    expect(res.status).toBe(200)
  })

  it('bindingがsuccess: falseを返す場合は429を返す', async () => {
    const app = buildApp(limiter)
    const env = { ...TEST_ENV, [binding]: { limit: async () => ({ success: false }) } }
    const res = await app.request('/test', { headers: { 'CF-Connecting-IP': '1.2.3.4' } }, env)
    expect(res.status).toBe(429)
    const body = (await res.json()) as { message: string }
    expect(body.message).toBe('Too Many Requests')
  })

  it('IPアドレスが取得できない場合はレートリミットをスキップする', async () => {
    const limitMock = vi.fn().mockResolvedValue({ success: false })
    const app = buildApp(limiter)
    const env = { ...TEST_ENV, [binding]: { limit: limitMock } }
    const res = await app.request('/test', {}, env)
    expect(res.status).toBe(200)
    expect(limitMock).not.toHaveBeenCalled()
  })

  it('bindingがエラーを投げた場合はフェイルオープンとしてリクエストを通過させる', async () => {
    const app = buildApp(limiter)
    const env = {
      ...TEST_ENV,
      [binding]: { limit: async () => { throw new Error('binding error') } },
    }
    const res = await app.request('/test', { headers: { 'CF-Connecting-IP': '1.2.3.4' } }, env)
    expect(res.status).toBe(200)
  })
})

describe('IPアドレスの決定ロジック', () => {
  it('CF-Connecting-IPが存在する場合、その値をキーとして使う', async () => {
    const limitMock = vi.fn().mockResolvedValue({ success: true })
    const app = buildApp(defaultRateLimiter)
    const env = { ...TEST_ENV, DEFAULT_RATE_LIMITER: { limit: limitMock } }
    await app.request('/test', { headers: { 'CF-Connecting-IP': '1.2.3.4' } }, env)
    expect(limitMock).toHaveBeenCalledWith({ key: '1.2.3.4' })
  })

  it('CF-Connecting-IPがなくX-Forwarded-Forが存在する場合、その値をキーとして使う', async () => {
    const limitMock = vi.fn().mockResolvedValue({ success: true })
    const app = buildApp(defaultRateLimiter)
    const env = { ...TEST_ENV, DEFAULT_RATE_LIMITER: { limit: limitMock } }
    await app.request('/test', { headers: { 'X-Forwarded-For': '5.6.7.8' } }, env)
    expect(limitMock).toHaveBeenCalledWith({ key: '5.6.7.8' })
  })

  it('X-Forwarded-Forがカンマ区切りの複数IPを含む場合、最初のIPを使う', async () => {
    const limitMock = vi.fn().mockResolvedValue({ success: true })
    const app = buildApp(defaultRateLimiter)
    const env = { ...TEST_ENV, DEFAULT_RATE_LIMITER: { limit: limitMock } }
    await app.request('/test', { headers: { 'X-Forwarded-For': '1.1.1.1, 2.2.2.2, 3.3.3.3' } }, env)
    expect(limitMock).toHaveBeenCalledWith({ key: '1.1.1.1' })
  })
})
