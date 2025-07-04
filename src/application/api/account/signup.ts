import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import {
  AccountInput,
  AccountRepositoryImpl,
  AccountService,
  UserRepositoryImpl,
} from '@/domain/account'
import getRdbClient, { Transaction } from '@/infrastructure/rdb'

export default async function signup(c: ZodValidatedContext<AccountInput>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const valid = c.req.valid('json')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const accountRepository = new AccountRepositoryImpl(rdb)
  const userRepository = new UserRepositoryImpl(rdb)
  const transaction = new Transaction(rdb)
  const service = new AccountService(accountRepository, userRepository)

  const result = await service.signup(transaction, valid.email, valid.password)
  if (isError(result)) throw handleError(result.error, logger)

  const account = result.data
  logger.info('sign up success', { accountId: account.accountId.toString() })
  return c.json({}, 201)
}
