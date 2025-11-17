import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import type { OffsetPaginationParams, OffsetPaginationResult } from '@/common/pagination'
import { createPrivacyPolicyUseCase, type PrivacyPolicy } from '@/domain/policy'

export type PolicyResponse = {
  version: number
  content: string
  effectiveAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type PolicyListResponse = OffsetPaginationResult<PolicyResponse>

function convertToResponse(policy: PrivacyPolicy): PolicyResponse {
  return {
    version: policy.version,
    content: policy.content,
    effectiveAt: policy.effectiveAt,
    createdAt: policy.createdAt,
    updatedAt: policy.updatedAt,
  }
}

export default createApiHandler({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, context: RequestContext<unknown, unknown, OffsetPaginationParams>) =>
    useCase.getAllPolicies(context.query.page, context.query.limit),
  transform: (data) => ({
    data: data.data.map(convertToResponse),
    page: data.page,
    limit: data.limit,
    total: data.total,
    totalPages: data.totalPages,
    hasNext: data.hasNext,
    hasPrev: data.hasPrev,
  }),
  logMessage: 'Privacy policies retrieved successfully',
  logPayload: (data, { query }) => ({
    count: data.data.length,
    page: query.page,
    limit: query.limit,
    total: data.total,
  }),
  statusCode: 200,
})
