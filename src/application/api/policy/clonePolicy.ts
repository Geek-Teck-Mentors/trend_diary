import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedParamContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { createPrivacyPolicyService, VersionParam } from '@/domain/policy'
import getRdbClient from '@/infrastructure/rdb'

export default async function clonePolicy(c: ZodValidatedParamContext<VersionParam>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const { version } = c.req.valid('param')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const service = createPrivacyPolicyService(rdb)

  const result = await service.clonePolicy(version)
  if (isError(result)) throw handleError(result.error, logger)

  logger.info('Policy cloned', { sourceVersion: version, newVersion: result.data.version })
  return c.json(result.data, 201)
}
