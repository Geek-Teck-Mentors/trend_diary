import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import CONTEXT_KEY from '@/application/middleware/context'
import { createSupabaseAuthUseCase } from '@/domain/supabaseAuth'
import { createSupabaseAuthClient } from '@/infrastructure/supabase'

export default async function me(c: Context) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const client = createSupabaseAuthClient(c)
  const useCase = createSupabaseAuthUseCase(client)

  const result = await useCase.getCurrentUser()
  if ('error' in result) {
    logger.error('Failed to get current user', { error: result.error })
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }

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
