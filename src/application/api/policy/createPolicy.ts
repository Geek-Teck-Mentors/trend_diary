import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { createPrivacyPolicyUseCase, PrivacyPolicyInput } from '@/domain/policy'
import getRdbClient from '@/infrastructure/rdb'

export default async function createPolicy(c: ZodValidatedContext<PrivacyPolicyInput>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const valid = c.req.valid('json')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const service = createPrivacyPolicyUseCase(rdb)

  const result = await service.createPolicy(valid.content)
  if (isError(result)) throw handleError(result.error, logger)
  logger.info('Policy created', { policy: result.data.version })

  return c.json(result.data, 201)
}
