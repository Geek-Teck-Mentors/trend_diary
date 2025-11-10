import { isFailure } from '@yuukihayashi0510/core'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedParamContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { createPrivacyPolicyUseCase, VersionParam } from '@/domain/policy'
import getRdbClient from '@/infrastructure/rdb'

export default async function clonePolicy(c: ZodValidatedParamContext<VersionParam>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const { version } = c.req.valid('param')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createPrivacyPolicyUseCase(rdb)

  const result = await useCase.clonePolicy(version)
  if (isFailure(result)) throw handleError(result.error, logger)

  logger.info('Policy cloned', { sourceVersion: version, newVersion: result.data.version })
  return c.json(result.data, 201)
}
