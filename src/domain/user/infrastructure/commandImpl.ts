import { Prisma } from '@prisma/client'
import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { RdbClient } from '@/infrastructure/rdb'
import { Command } from '../repository'
import type { ActiveUser, CurrentUser } from '../schema/activeUserSchema'
import { mapToActiveUser } from './mapper'

export default class CommandImpl implements Command {
  constructor(private readonly db: RdbClient) {}

  async createActive(email: string, hashedPassword: string): AsyncResult<CurrentUser, ServerError> {
    const activeUserResult = await wrapAsyncCall(() =>
      this.db.$transaction(async (tx: Prisma.TransactionClient) => {
        const user = await tx.user.create({})
        const activeUser = await tx.activeUser.create({
          data: {
            userId: user.userId,
            email,
            password: hashedPassword,
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

  async createActiveWithAuthenticationId(
    email: string,
    hashedPassword: string,
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
            password: hashedPassword,
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

  async saveActive(activeUser: ActiveUser): AsyncResult<CurrentUser, ServerError> {
    const updatedActiveUserResult = await wrapAsyncCall(() =>
      this.db.activeUser.update({
        where: { activeUserId: activeUser.activeUserId },
        data: {
          email: activeUser.email,
          password: activeUser.password,
          displayName: activeUser.displayName,
          lastLogin: activeUser.lastLogin,
        },
      }),
    )
    if (isFailure(updatedActiveUserResult)) {
      return failure(new ServerError(updatedActiveUserResult.error))
    }

    return success(mapToActiveUser(updatedActiveUserResult.data))
  }
}
