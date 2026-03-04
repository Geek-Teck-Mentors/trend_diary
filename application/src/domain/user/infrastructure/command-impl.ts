import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { RdbClient } from '@/infrastructure/rdb'
import { generateBigIntId, shouldUseExplicitBigIntId } from '@/infrastructure/rdb-id'
import { Command } from '../repository'
import type { CurrentUser } from '../schema/active-user-schema'
import { mapToActiveUser } from './mapper'

export default class CommandImpl implements Command {
  constructor(private readonly db: RdbClient) {}

  async createActiveWithAuthenticationId(
    email: string,
    authenticationId: string,
    displayName?: string | null,
  ): AsyncResult<CurrentUser, ServerError> {
    const explicitIdRequired = shouldUseExplicitBigIntId()
    const activeUserResult = await wrapAsyncCall(() =>
      this.db.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: explicitIdRequired ? { userId: generateBigIntId() } : {},
        })
        return await tx.activeUser.create({
          data: {
            ...(explicitIdRequired ? { activeUserId: generateBigIntId() } : {}),
            userId: user.userId,
            email,
            authenticationId,
            displayName,
          },
        })
      }),
    )

    if (isFailure(activeUserResult)) {
      return failure(new ServerError('Failed to create active user'))
    }

    return success(mapToActiveUser(activeUserResult.data))
  }
}
