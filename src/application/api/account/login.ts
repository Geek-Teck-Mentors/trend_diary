import { setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedContext } from '@/application/middleware/zodValidator'
import { SESSION_NAME } from '@/common/constants/session'
import { ClientError, ServerError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import {
  ActiveUserInput,
  ActiveUserRepositoryImpl,
  ActiveUserService,
  SessionRepositoryImpl,
  UserRepositoryImpl,
} from '@/domain/account'
import getRdbClient, { Transaction } from '@/infrastructure/rdb'

export default async function login(c: ZodValidatedContext<ActiveUserInput>) {
  const valid = c.req.valid('json')
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const activeUserRepository = new ActiveUserRepositoryImpl(rdb)
  const userRepository = new UserRepositoryImpl(rdb)
  const sessionRepository = new SessionRepositoryImpl(rdb)
  const transaction = new Transaction(rdb)
  const service = new ActiveUserService(activeUserRepository, userRepository, sessionRepository)

  // リクエストからIPアドレスとUserAgentを取得
  const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || ''
  const userAgent = c.req.header('user-agent') || ''

  const result = await service.login(transaction, valid.email, valid.password, ipAddress, userAgent)
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
    userId: res.user.userId.toString(),
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
