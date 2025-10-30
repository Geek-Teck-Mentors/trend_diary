import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { RdbClient } from '@/infrastructure/rdb'
import { Command } from '../repository'
import type { PrivacyPolicy } from '../schema/privacyPolicySchema'
import { mapToPrivacyPolicy } from './mapper'

export default class CommandImpl implements Command {
  constructor(private readonly db: RdbClient) {}

  async save(policy: PrivacyPolicy): AsyncResult<PrivacyPolicy, Error> {
    try {
      const savedPolicy = await this.db.privacyPolicy.upsert({
        where: { version: policy.version },
        update: {
          content: policy.content,
          effectiveAt: policy.effectiveAt,
          updatedAt: policy.updatedAt,
        },
        create: {
          version: policy.version,
          content: policy.content,
          effectiveAt: policy.effectiveAt,
          createdAt: policy.createdAt,
          updatedAt: policy.updatedAt,
        },
      })

      return success(mapToPrivacyPolicy(savedPolicy))
    } catch (error) {
      return failure(new ServerError(error))
    }
  }

  async deleteByVersion(version: number): AsyncResult<void, Error> {
    try {
      await this.db.privacyPolicy.delete({
        where: { version },
      })

      return success(undefined)
    } catch (error) {
      return failure(new ServerError(error))
    }
  }
}
