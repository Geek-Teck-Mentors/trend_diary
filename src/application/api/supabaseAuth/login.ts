import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { type AuthInput, createSupabaseAuthUseCase } from '@/domain/supabaseAuth'
import { createSupabaseAuthClient } from '@/infrastructure/supabase'

export default async function login(c: ZodValidatedContext<AuthInput>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const valid = c.req.valid('json')

  const client = createSupabaseAuthClient(c)
  const useCase = createSupabaseAuthUseCase(client)

  const result = await useCase.login(valid.email, valid.password)
  if (isError(result)) throw handleError(result.error, logger)

  const { user, session } = result.data
  logger.info('login success', { userId: user.id })

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
    },
    200,
  )
}
