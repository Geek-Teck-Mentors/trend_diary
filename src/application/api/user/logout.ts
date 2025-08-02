import { Context } from 'hono'
import { deleteCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import { Env } from '@/application/env'
import CONTEXT_KEY from '@/application/middleware/context'
import { SESSION_NAME } from '@/common/constants/session'
import { NotFoundError, ServerError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { createActiveUserService } from '@/domain/user'
import getRdbClient from '@/infrastructure/rdb'

export default async function logout(c: Context<Env>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const sessionId = c.get(CONTEXT_KEY.SESSION_ID)
  const rdb = getRdbClient(c.env.DATABASE_URL)
  const service = createActiveUserService(rdb)

  const result = await service.logout(sessionId)
  if (isError(result)) {
    const { error } = result
    if (error instanceof NotFoundError) {
      logger.warn('session not found', { sessionId })
      throw new HTTPException(error.statusCode as ContentfulStatusCode, {
        message: error.message,
      })
    }

    logger.error(error instanceof ServerError ? 'internal server error' : 'unknown error', error)
    throw new HTTPException(500, { message: 'Internal server error' })
  }

  deleteCookie(c, SESSION_NAME)
  logger.info('logout success')
  return c.body(null, 204)
}
