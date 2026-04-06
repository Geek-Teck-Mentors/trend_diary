import { isFailure, wrapAsyncCall } from '@yuukihayashi0510/core'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import type { Env } from '@/web/env'
import CONTEXT_KEY from './context'

const createRateLimiter = (binding: 'STRICT_RATE_LIMITER' | 'DEFAULT_RATE_LIMITER') =>
  createMiddleware<Env>(async (c, next) => {
    const rateLimiter = c.env[binding]

    if (!rateLimiter) return next()

    const ip = (
      c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For')?.split(',')[0]
    )?.trim()

    // CF環境ではIPが必ず付与されるため、IP不明はbindingのない非CF環境でのみ起こりうる
    if (!ip) return next()

    const limitResult = await wrapAsyncCall(() => rateLimiter.limit({ key: ip }))

    if (isFailure(limitResult)) {
      // bindingのエラー時はフェイルオープンとして処理を継続
      c.get(CONTEXT_KEY.APP_LOG)?.error('Rate limiter error', { error: limitResult.error, binding })
      return next()
    }

    if (!limitResult.data.success) {
      const logger = c.get(CONTEXT_KEY.APP_LOG)
      logger?.warn('Rate limit exceeded', { ip, path: c.req.path, binding })
      throw new HTTPException(429, { message: 'Too Many Requests' })
    }

    return next()
  })

export const strictRateLimiter = createRateLimiter('STRICT_RATE_LIMITER')
export const defaultRateLimiter = createRateLimiter('DEFAULT_RATE_LIMITER')
