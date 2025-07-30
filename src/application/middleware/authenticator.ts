import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { SESSION_NAME } from '@/common/constants/session'
import { NotFoundError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { 
  ActiveUserRepositoryImpl, 
  UserRepositoryImpl, 
  SessionRepositoryImpl,
  ActiveUserService 
} from '@/domain/account'
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
  const activeUserRepository = new ActiveUserRepositoryImpl(rdb)
  const userRepository = new UserRepositoryImpl(rdb)
  const sessionRepository = new SessionRepositoryImpl(rdb)
  const service = new ActiveUserService(activeUserRepository, userRepository, sessionRepository)

  const result = await service.findBySessionId(sessionId)
  if (isError(result)) {
    logger.error('Error occurred while authenticating', { error: result })
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }

  if (!result.data) {
    logger.error('Session not found', { sessionId })
    throw new HTTPException(401, { message: 'login required' })
  }

  // セッションユーザー情報を設定
  const sessionUser = {
    userId: result.data.user.userId,
    activeUserId: result.data.activeUser.activeUserId,
    displayName: result.data.activeUser.displayName,
    email: result.data.activeUser.email,
  }

  c.set(CONTEXT_KEY.SESSION_USER, sessionUser)
  c.set(CONTEXT_KEY.SESSION_ID, sessionId)
  return next()
})

export default authenticator
