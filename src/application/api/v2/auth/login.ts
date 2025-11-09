import { isFailure } from '@yuukihayashi0510/core'
import { setCookie } from 'hono/cookie'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedContext } from '@/application/middleware/zodValidator'
import { SESSION_NAME } from '@/common/constants'
import { handleError } from '@/common/errors'
import { type AuthInput, createAuthV2UseCase } from '@/domain/auth-v2'
import getRdbClient from '@/infrastructure/rdb'
import { createSupabaseAuthClient } from '@/infrastructure/supabase'

export default async function login(c: ZodValidatedContext<AuthInput>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const valid = c.req.valid('json')

  const client = createSupabaseAuthClient(c)
  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createAuthV2UseCase(client, rdb)

  const result = await useCase.login(valid.email, valid.password)
  if (isFailure(result)) throw handleError(result.error, logger)

  const { activeUser, sessionId, expiresAt } = result.data
  logger.info('login success', { activeUserId: activeUser.activeUserId })

  // セッションIDをCookieにセット
  setCookie(c, SESSION_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    expires: expiresAt,
    sameSite: 'lax',
  })

  return c.json(
    {
      displayName: activeUser.displayName,
    },
    200,
  )
}
