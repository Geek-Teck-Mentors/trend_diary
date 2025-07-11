import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { SESSION_NAME } from '@/common/constants/session'
import { NotFoundError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { AccountRepositoryImpl, AccountService, UserRepositoryImpl } from '@/domain/account'
import getRdbClient from '@/infrastructure/rdb'
import { Env } from '../env'
import CONTEXT_KEY from './context'

const authenticator = createMiddleware<Env>(async (c, next) => {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const sessionId = getCookie(c, SESSION_NAME)
  if (!sessionId) throw new HTTPException(401, { message: 'login required' })

  // SQLインジェクション対策
  const valid = z.string().uuid().safeParse(sessionId)
  if (!valid.success) {
    logger.warn('invalid sid format', { sessionId })
    throw new HTTPException(401, { message: 'login required' })
  }

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const service = new AccountService(new AccountRepositoryImpl(rdb), new UserRepositoryImpl(rdb))

  const result = await service.getLoginUser(sessionId)
  if (isError(result)) {
    if (result.error instanceof NotFoundError) {
      logger.error('Session not found', result.error, { sessionId })
      throw new HTTPException(401, { message: 'login required' })
    }
    logger.error('Error occurred while authenticating', { error: result })
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }

  c.set(CONTEXT_KEY.SESSION_USER, result.data)
  c.set(CONTEXT_KEY.SESSION_ID, sessionId)
  return next()
})

export default authenticator
