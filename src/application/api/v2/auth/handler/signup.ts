import { isFailure } from '@yuukihayashi0510/core'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedContext } from '@/application/middleware/zodValidator'
import { ExternalServiceError, handleError } from '@/common/errors'
import { type AuthInput, createAuthV2UseCase } from '@/domain/user'
import getRdbClient from '@/infrastructure/rdb'
import { createSupabaseAuthClient } from '@/infrastructure/supabase'

export default async function signup(c: ZodValidatedContext<AuthInput>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const valid = c.req.valid('json')

  const client = createSupabaseAuthClient(c)
  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createAuthV2UseCase(client, rdb)

  const result = await useCase.signup(valid.email, valid.password)
  if (isFailure(result)) {
    // 補償トランザクション失敗時のログ出力
    if (result.error instanceof ExternalServiceError) {
      logger.error('Compensation transaction failed: Supabase Auth user deletion failed', {
        context: result.error.context,
        errors: {
          original: result.error.originalError.message,
          compensation: result.error.serviceError.message,
        },
      })
    }
    throw handleError(result.error, logger)
  }

  const { activeUser } = result.data
  logger.info('signup success', { activeUserId: activeUser.activeUserId })

  return c.json({}, 201)
}
