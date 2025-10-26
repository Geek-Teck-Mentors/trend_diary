import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { type AuthInput, createSupabaseAuthUseCase } from '@/domain/supabaseAuth'
import { createSupabaseAuthClient } from '@/infrastructure/supabase'

export default async function signup(c: ZodValidatedContext<AuthInput>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const valid = c.req.valid('json')

  const client = createSupabaseAuthClient(c)
  const useCase = createSupabaseAuthUseCase(client)

  const result = await useCase.signup(valid.email, valid.password)
  if (isError(result)) throw handleError(result.error, logger)

  const { user } = result.data
  logger.info('signup success', { userId: user.id })

  return c.json({ user: { id: user.id, email: user.email } }, 201)
}
