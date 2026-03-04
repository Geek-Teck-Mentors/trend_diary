import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { RdbClient } from '@/infrastructure/rdb'
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
    const lastUserResult = await wrapAsyncCall(() =>
      this.db.user.findFirst({
        orderBy: { userId: 'desc' },
        select: { userId: true },
      }),
    )
    if (isFailure(lastUserResult)) {
      return failure(new ServerError(lastUserResult.error))
    }

    const nextUserId = (lastUserResult.data?.userId ?? 0n) + 1n

    const userResult = await wrapAsyncCall(() =>
      this.db.user.create({
        data: { userId: nextUserId },
      }),
    )
    if (isFailure(userResult)) {
      return failure(new ServerError(userResult.error))
    }

    const lastActiveUserResult = await wrapAsyncCall(() =>
      this.db.activeUser.findFirst({
        orderBy: { activeUserId: 'desc' },
        select: { activeUserId: true },
      }),
    )
    if (isFailure(lastActiveUserResult)) {
      return failure(new ServerError(lastActiveUserResult.error))
    }

    const nextActiveUserId = (lastActiveUserResult.data?.activeUserId ?? 0n) + 1n

    const activeUserResult = await wrapAsyncCall(() =>
      this.db.activeUser.create({
        data: {
          activeUserId: nextActiveUserId,
          userId: userResult.data.userId,
          email,
          authenticationId,
          displayName,
        },
      }),
    )

    if (isFailure(activeUserResult)) {
      // 2段階実行のため補償削除を実行
      const compensationResult = await wrapAsyncCall(() =>
        this.db.user.delete({
          where: {
            userId: userResult.data.userId,
          },
        }),
      )

      if (isFailure(compensationResult)) {
        return failure(
          new ServerError(
            `Failed to create active user and compensation delete failed: ${String(compensationResult.error)}`,
          ),
        )
      }

      return failure(new ServerError(activeUserResult.error))
    }

    return success(mapToActiveUser(activeUserResult.data))
  }
}
