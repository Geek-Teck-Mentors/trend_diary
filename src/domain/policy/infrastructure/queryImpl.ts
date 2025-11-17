import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { OffsetPaginationResult } from '@/common/pagination'
import { Nullable } from '@/common/types/utility'
import { RdbClient } from '@/infrastructure/rdb'
import { Query } from '../repository'
import type { PrivacyPolicy } from '../schema/privacyPolicySchema'
import { mapToPrivacyPolicy } from './mapper'

export default class QueryImpl implements Query {
  constructor(private readonly db: RdbClient) {}

  async findAll(
    page: number,
    limit: number,
  ): AsyncResult<OffsetPaginationResult<PrivacyPolicy>, Error> {
    const result = await wrapAsyncCall(() =>
      Promise.all([
        this.db.privacyPolicy.findMany({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { version: 'desc' },
        }),
        this.db.privacyPolicy.count(),
      ]),
    )
    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    const [policies, total] = result.data
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    const paginationResult: OffsetPaginationResult<PrivacyPolicy> = {
      data: policies.map(mapToPrivacyPolicy),
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    }

    return success(paginationResult)
  }

  async findByVersion(version: number): AsyncResult<Nullable<PrivacyPolicy>, Error> {
    const policyResult = await wrapAsyncCall(() =>
      this.db.privacyPolicy.findUnique({
        where: { version },
      }),
    )
    if (isFailure(policyResult)) {
      return failure(new ServerError(policyResult.error))
    }

    const policy = policyResult.data
    if (!policy) {
      return success(null)
    }

    return success(mapToPrivacyPolicy(policy))
  }

  async getLatestDraft(): AsyncResult<Nullable<PrivacyPolicy>, Error> {
    const policyResult = await wrapAsyncCall(() =>
      this.db.privacyPolicy.findFirst({
        where: { effectiveAt: null },
        orderBy: { version: 'desc' },
      }),
    )
    if (isFailure(policyResult)) {
      return failure(new ServerError(policyResult.error))
    }

    const policy = policyResult.data
    if (!policy) {
      return success(null)
    }

    return success(mapToPrivacyPolicy(policy))
  }

  async getNextVersion(): AsyncResult<number, Error> {
    const latestPolicyResult = await wrapAsyncCall(() =>
      this.db.privacyPolicy.findFirst({
        orderBy: { version: 'desc' },
      }),
    )
    if (isFailure(latestPolicyResult)) {
      return failure(new ServerError(latestPolicyResult.error))
    }

    const latestPolicy = latestPolicyResult.data
    if (!latestPolicy) {
      return success(1)
    }

    return success(latestPolicy.version + 1)
  }
}
