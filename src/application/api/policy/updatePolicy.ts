import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedParamJsonContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { createPrivacyPolicyService, PrivacyPolicyUpdate, VersionParam } from '@/domain/policy'
import getRdbClient from '@/infrastructure/rdb'

export default async function updatePolicy(
  c: ZodValidatedParamJsonContext<VersionParam, PrivacyPolicyUpdate>,
) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const { version } = c.req.valid('param')
  const { content } = c.req.valid('json')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const service = createPrivacyPolicyService(rdb)

  const result = await service.updatePolicy(version, content)
  if (isError(result)) throw handleError(result.error, logger)

  logger.info('Policy updated', { version })
  return c.json(result.data)
}
