import { isFailure } from '@yuukihayashi0510/core'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { type AuthInput, createSupabaseAuthenticationUseCase } from '@/domain/supabaseAuth'
import getRdbClient from '@/infrastructure/rdb'
import { createSupabaseAuthClient } from '@/infrastructure/supabase'

export default async function signup(c: ZodValidatedContext<AuthInput>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const valid = c.req.valid('json')

  const client = createSupabaseAuthClient(c)
  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createSupabaseAuthenticationUseCase(client, rdb)

  const result = await useCase.signup(valid.email, valid.password)
  if (isFailure(result)) throw handleError(result.error, logger)

  const { user, session, activeUser } = result.data
  logger.info('signup success', { userId: user.id, activeUserId: activeUser.activeUserId })

  return c.json(
    {
      user: {
        id: user.id,
        email: user.email,
      },
      session: session
        ? {
            expiresIn: session.expiresIn,
            expiresAt: session.expiresAt,
          }
        : null,
      activeUser: {
        activeUserId: activeUser.activeUserId.toString(),
        email: activeUser.email,
      },
    },
    201,
  )
}
