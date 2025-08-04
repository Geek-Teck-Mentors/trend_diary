import CONTEXT_KEY from '@/application/middleware/context'
import {
  ZodValidatedContext,
  ZodValidatedParamContext,
  ZodValidatedParamJsonContext,
} from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { createPrivacyPolicyService, PrivacyPolicyActivate, VersionParam } from '@/domain/policy'
import getRdbClient from '@/infrastructure/rdb'

export default async function activatePolicy(
  c: ZodValidatedParamJsonContext<VersionParam, PrivacyPolicyActivate>,
) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const { version } = c.req.valid('param')
  const { effectiveAt } = c.req.valid('json')

  // effectiveAtが未指定の場合は現在時刻を使用
  const effectiveDate = effectiveAt || new Date()

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const service = createPrivacyPolicyService(rdb)

  const result = await service.activatePolicy(version, effectiveDate)
  if (isError(result)) throw handleError(result.error, logger)

  logger.info('Policy activated', { version, effectiveAt: effectiveDate })
  return c.json(result.data)
}
