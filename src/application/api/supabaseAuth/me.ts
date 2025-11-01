import { isFailure } from '@yuukihayashi0510/core'
import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import CONTEXT_KEY from '@/application/middleware/context'
import { handleError } from '@/common/errors'
import { createSupabaseAuthenticationUseCase } from '@/domain/supabaseAuth'
import getRdbClient from '@/infrastructure/rdb'
import { createSupabaseAuthClient } from '@/infrastructure/supabase'

export default async function me(c: Context) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const client = createSupabaseAuthClient(c)
  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createSupabaseAuthenticationUseCase(client, rdb)

  const result = await useCase.getCurrentUser()
  if (isFailure(result)) throw handleError(result.error, logger)

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
