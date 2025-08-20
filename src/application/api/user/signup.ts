import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { ActiveUserInput, createUserUseCase } from '@/domain/user'

import getRdbClient from '@/infrastructure/rdb'

export default async function signup(c: ZodValidatedContext<ActiveUserInput>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const valid = c.req.valid('json')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const service = createUserUseCase(rdb)

  const result = await service.signup(valid.email, valid.password)
  if (isError(result)) throw handleError(result.error, logger)

  const activeUser = result.data
  logger.info('sign up success', { activeUserId: activeUser.activeUserId.toString() })
  return c.json({}, 201)
}
