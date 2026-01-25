import { Prisma } from '@prisma/client'
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
    const activeUserResult = await wrapAsyncCall(() =>
      this.db.$transaction(async (tx: Prisma.TransactionClient) => {
        const user = await tx.user.create({})
        const activeUser = await tx.activeUser.create({
          data: {
            userId: user.userId,
            email,
            authenticationId,
            displayName,
          },
        })
        return activeUser
      }),
    )
    if (isFailure(activeUserResult)) {
      return failure(new ServerError(activeUserResult.error))
    }

    return success(mapToActiveUser(activeUserResult.data))
  }
}
