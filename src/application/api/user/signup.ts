import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import {
  ActiveUserInput,
  ActiveUserRepositoryImpl,
  ActiveUserService,
  SessionRepositoryImpl,
  UserRepositoryImpl,
} from '@/domain/user'
import getRdbClient, { Transaction } from '@/infrastructure/rdb'

export default async function signup(c: ZodValidatedContext<ActiveUserInput>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const valid = c.req.valid('json')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const activeUserRepository = new ActiveUserRepositoryImpl(rdb)
  const userRepository = new UserRepositoryImpl(rdb)
  const sessionRepository = new SessionRepositoryImpl(rdb)
  const transaction = new Transaction(rdb)
  const service = new ActiveUserService(activeUserRepository, userRepository, sessionRepository)

  const result = await service.signup(transaction, valid.email, valid.password, valid.displayName)
  if (isError(result)) throw handleError(result.error, logger)

  const activeUser = result.data
  logger.info('sign up success', { activeUserId: activeUser.activeUserId.toString() })
  return c.json({}, 201)
}
