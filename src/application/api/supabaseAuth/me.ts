import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import CONTEXT_KEY from '@/application/middleware/context'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { createSupabaseAuthUseCase } from '@/domain/supabaseAuth'
import { createSupabaseAuthClient } from '@/infrastructure/supabase'

export default async function me(c: Context) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const client = createSupabaseAuthClient(c)
  const useCase = createSupabaseAuthUseCase(client)

  const result = await useCase.getCurrentUser()
  if (isError(result)) throw handleError(result.error, logger)

  const user = result.data
  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  logger.info('get current user success', { userId: user.id })

  return c.json({
    user: {
      id: user.id,
      email: user.email,
    },
  })
}
