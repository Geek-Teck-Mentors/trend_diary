import { isFailure } from '@yuukihayashi0510/core'
import type { Context } from 'hono'
import CONTEXT_KEY from '@/application/middleware/context'
import { ClientError, handleError } from '@/common/errors'
import { createAuthV2UseCase } from '@/domain/auth-v2'
import QueryImpl from '@/domain/user/infrastructure/queryImpl'
import getRdbClient from '@/infrastructure/rdb'
import { createSupabaseAuthClient } from '@/infrastructure/supabase'

export default async function me(c: Context) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const client = createSupabaseAuthClient(c)
  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createAuthV2UseCase(client, rdb)

  const authUserResult = await useCase.getCurrentUser()
  if (isFailure(authUserResult)) throw handleError(authUserResult.error, logger)

  const authUser = authUserResult.data

  // authentication_idで既存のactive_userを取得してdisplayNameを返す
  const userQuery = new QueryImpl(rdb)
  const activeUserResult = await userQuery.findActiveByAuthenticationId(authUser.id)
  if (isFailure(activeUserResult)) throw handleError(activeUserResult.error, logger)

  if (!activeUserResult.data) {
    logger.error('Active user not found for authenticated user', { authUserId: authUser.id })
    throw handleError(new ClientError('User not found', 404), logger)
  }

  const activeUser = activeUserResult.data

  logger.info('get current user success', { userId: activeUser.userId })

  return c.json({
    user: {
      displayName: activeUser.displayName,
      isAdmin: activeUser.adminUserId !== null,
    },
  })
}
