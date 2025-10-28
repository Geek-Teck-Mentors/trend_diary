import { isFailure } from '@yuukihayashi0510/core'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { handleError } from '@/common/errors'
import { createAdminUserUseCase } from '@/domain/admin'
import getRdbClient from '@/infrastructure/rdb'
import { Env } from '../env'
import CONTEXT_KEY from './context'

const requiredAdmin = createMiddleware<Env>(async (c, next) => {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  // authenticatorミドルウェアでSESSION_USERが設定されていることを確認
  const sessionUser = c.get(CONTEXT_KEY.SESSION_USER)
  if (!sessionUser) {
    logger.warn('Admin auth: SESSION_USER not found')
    throw new HTTPException(401, { message: 'login required' })
  }

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const adminUserUseCase = createAdminUserUseCase(rdb)

  // Admin権限チェック
  const result = await adminUserUseCase.isAdmin(sessionUser.activeUserId)
  if (isFailure(result)) {
    throw handleError(result.error, logger)
  }

  if (!result.data) {
    logger.warn('Admin permission denied', { activeUserId: sessionUser.activeUserId })
    throw new HTTPException(403, { message: 'Admin permission required' })
  }

  // Admin権限確認済み、次のミドルウェアに進む
  return next()
})

export default requiredAdmin
