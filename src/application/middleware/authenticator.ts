import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import { z } from 'zod'
import { SESSION_NAME } from '@/common/constants/session'
import { ClientError, ServerError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { createUserUseCase } from '@/domain/user'
import getRdbClient from '@/infrastructure/rdb'
import { Env, SessionUser } from '../env'
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
  const service = createUserUseCase(rdb)

  const result = await service.getCurrentUser(sessionId)
  if (isError(result)) {
    if (result.error instanceof ClientError) {
      throw new HTTPException(result.error.statusCode as ContentfulStatusCode, {
        message: result.error.message,
      })
    }
    if (result.error instanceof ServerError) {
      logger.error('Error occurred while authenticating', { error: result.error })
      throw new HTTPException(result.error.statusCode as ContentfulStatusCode, {
        message: 'Internal Server Error',
      })
    }
    logger.error('Unexpected error occurred', { error: result.error })
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }

  if (!result.data) {
    throw new HTTPException(404, { message: 'login required' })
  }

  // セッションユーザー情報を設定
  const sessionUser: SessionUser = {
    activeUserId: result.data.activeUserId,
    displayName: result.data.displayName,
    email: result.data.email,
    isAdmin: result.data.adminUserId !== null,
    adminUserId: result.data.adminUserId,
  }

  c.set(CONTEXT_KEY.SESSION_USER, sessionUser)
  c.set(CONTEXT_KEY.SESSION_ID, sessionId)
  return next()
})

export default authenticator
