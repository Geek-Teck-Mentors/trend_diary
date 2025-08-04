import { getErrorMessage } from '@/common/errors'
import { OffsetPaginationResult } from '@/common/pagination'
import { AsyncResult, Nullable, resultError, resultSuccess } from '@/common/types/utility'
import { RdbClient } from '@/infrastructure/rdb'
import PrivacyPolicy from '../model/privacyPolicy'
import { QueryService } from '../repository/queryService'
import { mapToPrivacyPolicy } from './mapper'

export default class QueryServiceImpl implements QueryService {
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

      return resultSuccess(result)
    } catch (error) {
      return resultError(new Error(getErrorMessage(error)))
    }
  }

  async findByVersion(version: number): AsyncResult<Nullable<PrivacyPolicy>, Error> {
    try {
      const policy = await this.db.privacyPolicy.findUnique({
        where: { version },
      })

      if (!policy) {
        return resultSuccess(null)
      }

      return resultSuccess(mapToPrivacyPolicy(policy))
    } catch (error) {
      return resultError(new Error(getErrorMessage(error)))
    }
  }

  async getLatestDraft(): AsyncResult<Nullable<PrivacyPolicy>, Error> {
    try {
      const policy = await this.db.privacyPolicy.findFirst({
        where: { effectiveAt: null },
        orderBy: { version: 'desc' },
      })

      if (!policy) {
        return resultSuccess(null)
      }

      return resultSuccess(mapToPrivacyPolicy(policy))
    } catch (error) {
      return resultError(new Error(getErrorMessage(error)))
    }
  }

  async getNextVersion(): AsyncResult<number, Error> {
    try {
      const latestPolicy = await this.db.privacyPolicy.findFirst({
        orderBy: { version: 'desc' },
      })

      if (!latestPolicy) {
        return resultSuccess(1)
      }

      return resultSuccess(latestPolicy.version + 1)
    } catch (error) {
      return resultError(new Error(getErrorMessage(error)))
    }
  }
}
