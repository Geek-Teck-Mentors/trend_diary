import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { type AuthInput, createSupabaseAuthenticationUseCase } from '@/domain/supabaseAuth'
import getRdbClient from '@/infrastructure/rdb'
import { createSupabaseAuthClient } from '@/infrastructure/supabase'

export default async function login(c: ZodValidatedContext<AuthInput>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const valid = c.req.valid('json')

  const client = createSupabaseAuthClient(c)
  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createSupabaseAuthenticationUseCase(client, rdb)

  const result = await useCase.login(valid.email, valid.password)
  if (isError(result)) throw handleError(result.error, logger)

  const { user, session, activeUser } = result.data
  logger.info('login success', { userId: user.id, activeUserId: activeUser.activeUserId })

  return c.json(
    {
      user: {
        id: user.id,
        email: user.email,
      },
      session: {
        expiresIn: session.expiresIn,
        expiresAt: session.expiresAt,
      },
      activeUser: {
        activeUserId: activeUser.activeUserId.toString(),
        email: activeUser.email,
      },
    },
    200,
  )
}
