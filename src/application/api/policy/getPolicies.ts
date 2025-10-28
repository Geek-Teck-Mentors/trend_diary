import { isFailure } from '@yuukihayashi0510/core'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedQueryContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { OffsetPaginationParams } from '@/common/pagination'
import { createPrivacyPolicyUseCase, PrivacyPolicy } from '@/domain/policy'
import getRdbClient from '@/infrastructure/rdb'
import { PolicyListResponse, PolicyResponse } from './response'

function convertToResponse(policy: PrivacyPolicy): PolicyResponse {
  return {
    version: policy.version,
    content: policy.content,
    effectiveAt: policy.effectiveAt,
    createdAt: policy.createdAt,
    updatedAt: policy.updatedAt,
  }
}

export default async function getPolicies(c: ZodValidatedQueryContext<OffsetPaginationParams>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const { page, limit } = c.req.valid('query')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createPrivacyPolicyUseCase(rdb)

  const result = await useCase.getAllPolicies(page, limit)
  if (isFailure(result)) throw handleError(result.error, logger)

  logger.info('Privacy policies retrieved successfully', {
    count: result.data.data.length,
    page,
    limit,
    total: result.data.total,
  })

  const response: PolicyListResponse = {
    data: result.data.data.map(convertToResponse),
    page: result.data.page,
    limit: result.data.limit,
    total: result.data.total,
    totalPages: result.data.totalPages,
    hasNext: result.data.hasNext,
    hasPrev: result.data.hasPrev,
  }

  return c.json(response)
}
