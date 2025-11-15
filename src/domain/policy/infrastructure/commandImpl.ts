import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { RdbClient } from '@/infrastructure/rdb'
import { Command } from '../repository'
import type { PrivacyPolicy } from '../schema/privacyPolicySchema'
import { mapToPrivacyPolicy } from './mapper'

export default class CommandImpl implements Command {
  constructor(private readonly db: RdbClient) {}

  async save(policy: PrivacyPolicy): AsyncResult<PrivacyPolicy, Error> {
    const savedPolicyResult = await wrapAsyncCall(() =>
      this.db.privacyPolicy.upsert({
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
      }),
    )
    if (isFailure(savedPolicyResult)) {
      return failure(new ServerError(savedPolicyResult.error))
    }

    return success(mapToPrivacyPolicy(savedPolicyResult.data))
  }

  async deleteByVersion(version: number): AsyncResult<void, Error> {
    const result = await wrapAsyncCall(() =>
      this.db.privacyPolicy.delete({
        where: { version },
      }),
    )
    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    return success(undefined)
  }
}
