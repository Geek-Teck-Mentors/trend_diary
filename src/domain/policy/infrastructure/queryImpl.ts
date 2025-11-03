import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
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
    try {
      const [policies, total] = await Promise.all([
        this.db.privacyPolicy.findMany({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { version: 'desc' },
        }),
        this.db.privacyPolicy.count(),
      ])

      const totalPages = Math.ceil(total / limit)
      const hasNext = page < totalPages
      const hasPrev = page > 1

      const result: OffsetPaginationResult<PrivacyPolicy> = {
        data: policies.map(mapToPrivacyPolicy),
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      }

      return success(result)
    } catch (error) {
      return failure(new ServerError(error))
    }
  }

  async findByVersion(version: number): AsyncResult<Nullable<PrivacyPolicy>, Error> {
    try {
      const policy = await this.db.privacyPolicy.findUnique({
        where: { version },
      })

      if (!policy) {
        return success(null)
      }

      return success(mapToPrivacyPolicy(policy))
    } catch (error) {
      return failure(new ServerError(error))
    }
  }

  async getLatestDraft(): AsyncResult<Nullable<PrivacyPolicy>, Error> {
    try {
      const policy = await this.db.privacyPolicy.findFirst({
        where: { effectiveAt: null },
        orderBy: { version: 'desc' },
      })

      if (!policy) {
        return success(null)
      }

      return success(mapToPrivacyPolicy(policy))
    } catch (error) {
      return failure(new ServerError(error))
    }
  }

  async getNextVersion(): AsyncResult<number, Error> {
    try {
      const latestPolicy = await this.db.privacyPolicy.findFirst({
        orderBy: { version: 'desc' },
      })

      if (!latestPolicy) {
        return success(1)
      }

      return success(latestPolicy.version + 1)
    } catch (error) {
      return failure(new ServerError(error))
    }
  }
}
