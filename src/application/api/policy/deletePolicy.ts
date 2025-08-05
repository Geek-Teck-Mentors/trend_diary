import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedParamContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { createPrivacyPolicyService, VersionParam } from '@/domain/policy'
import getRdbClient from '@/infrastructure/rdb'

export default async function deletePolicy(c: ZodValidatedParamContext<VersionParam>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const { version } = c.req.valid('param')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const service = createPrivacyPolicyService(rdb)

  const result = await service.deletePolicy(version)
  if (isError(result)) throw handleError(result.error, logger)

  logger.info('Policy deleted', { version })
  return c.body(null, 204)
}
