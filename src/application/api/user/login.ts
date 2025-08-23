import { getConnInfo } from 'hono/cloudflare-workers'
import { setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedContext } from '@/application/middleware/zodValidator'
import { SESSION_NAME } from '@/common/constant'
import { ClientError, ServerError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { ActiveUserInput, createUserUseCase } from '@/domain/user'
import getRdbClient from '@/infrastructure/rdb'

export default async function login(c: ZodValidatedContext<ActiveUserInput>) {
  const valid = c.req.valid('json')
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createUserUseCase(rdb)

  // リクエストからIPアドレスとUserAgentを取得
  const connInfo = getConnInfo(c)
  const ipAddress = connInfo.remote.address || ''
  const userAgent = c.req.header('user-agent') || ''

  const result = await useCase.login(valid.email, valid.password, ipAddress, userAgent)
  if (isError(result)) {
    const { error } = result
    if (error instanceof ClientError) {
      throw new HTTPException(error.statusCode as ContentfulStatusCode, {
        message: error.message,
      })
    }
    logger.error(error instanceof ServerError ? 'internal server error' : 'unknown error', error)
    throw new HTTPException(500, { message: 'Internal server error' })
  }

  const res = result.data
  logger.info('login success', {
    activeUserId: res.activeUser.activeUserId.toString(),
  })

  // セッションIDをCookieにセット
  setCookie(c, SESSION_NAME, res.sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // ローカルだけHTTP
    expires: res.expiresAt,
    sameSite: 'lax',
  })

  return c.json(
    {
      displayName: res.activeUser.displayName,
    },
    200,
  )
}
