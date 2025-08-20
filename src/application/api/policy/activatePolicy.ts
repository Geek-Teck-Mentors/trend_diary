import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedParamJsonContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { createPrivacyPolicyUseCase, PrivacyPolicyActivate, VersionParam } from '@/domain/policy'
import getRdbClient from '@/infrastructure/rdb'

export default async function activatePolicy(
  c: ZodValidatedParamJsonContext<VersionParam, PrivacyPolicyActivate>,
) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const { version } = c.req.valid('param')
  const { effectiveAt } = c.req.valid('json')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createPrivacyPolicyUseCase(rdb)

  const result = await useCase.activatePolicy(version, effectiveAt)
  if (isError(result)) throw handleError(result.error, logger)

  logger.info('Policy activated', { version, effectiveAt })
  return c.json(result.data)
}
