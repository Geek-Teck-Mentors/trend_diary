import { isFailure } from '@yuukihayashi0510/core'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedParamJsonContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { createPrivacyPolicyUseCase, PrivacyPolicyUpdate, VersionParam } from '@/domain/policy'
import getRdbClient from '@/infrastructure/rdb'

export default async function updatePolicy(
  c: ZodValidatedParamJsonContext<VersionParam, PrivacyPolicyUpdate>,
) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const { version } = c.req.valid('param')
  const { content } = c.req.valid('json')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createPrivacyPolicyUseCase(rdb)

  const result = await useCase.updatePolicy(version, content)
  if (isFailure(result)) throw handleError(result.error, logger)

  logger.info('Policy updated', { version })
  return c.json(result.data)
}
