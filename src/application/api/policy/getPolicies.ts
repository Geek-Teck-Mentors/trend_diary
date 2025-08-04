import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedQueryContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { OffsetPaginationParams, OffsetPaginationResult } from '@/common/pagination'
import { isError } from '@/common/types/utility'
import { createPrivacyPolicyService, PrivacyPolicy } from '@/domain/policy'
import getRdbClient from '@/infrastructure/rdb'

type PolicyResponse = {
  version: number
  content: string
  effectiveAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type PoliciesListResponse = OffsetPaginationResult<PolicyResponse>

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
  const service = createPrivacyPolicyService(rdb)

  const result = await service.getAllPolicies(page, limit)
  if (isError(result)) throw handleError(result.error, logger)

  logger.info('Privacy policies retrieved successfully', {
    count: result.data.data.length,
    page,
    limit,
    total: result.data.total,
  })

  const response: PoliciesListResponse = {
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
