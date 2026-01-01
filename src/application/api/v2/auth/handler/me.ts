import { isFailure } from '@yuukihayashi0510/core'
import type { Context } from 'hono'
import CONTEXT_KEY from '@/application/middleware/context'
import { handleError } from '@/common/errors'
import { createAuthV2UseCase } from '@/domain/user'
import getRdbClient from '@/infrastructure/rdb'
import { createSupabaseAuthClient } from '@/infrastructure/supabase'

export default async function me(c: Context) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const client = createSupabaseAuthClient(c)
  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createAuthV2UseCase(client, rdb)

  const activeUserResult = await useCase.getCurrentActiveUser()
  if (isFailure(activeUserResult)) {
    throw handleError(activeUserResult.error, logger)
  }

  const activeUser = activeUserResult.data

  logger.info('get current user success', { userId: activeUser.userId })

  return c.json({
    user: {
      displayName: activeUser.displayName,
    },
  })
}
