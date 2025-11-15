import { Prisma } from '@prisma/client'
import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { RdbClient } from '@/infrastructure/rdb'
import { CreateSessionInput } from '../dto'
import { Command } from '../repository'
import type { ActiveUser } from '../schema/activeUserSchema'
import { mapToActiveUser } from './mapper'

export default class CommandImpl implements Command {
  constructor(private readonly db: RdbClient) {}

  async createActive(email: string, hashedPassword: string): AsyncResult<ActiveUser, ServerError> {
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
  ): AsyncResult<ActiveUser, ServerError> {
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

  async saveActive(activeUser: ActiveUser): AsyncResult<ActiveUser, ServerError> {
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

  async createSession(
    input: CreateSessionInput,
  ): AsyncResult<{ sessionId: string; expiresAt: Date }, ServerError> {
    const sessionResult = await wrapAsyncCall(() =>
      this.db.session.create({
        data: {
          sessionId: input.sessionId,
          activeUserId: input.activeUserId,
          sessionToken: input.sessionToken,
          expiresAt: input.expiresAt,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      }),
    )
    if (isFailure(sessionResult)) {
      return failure(new ServerError(sessionResult.error))
    }

    const session = sessionResult.data
    return success({
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
    })
  }

  async deleteSession(sessionId: string): AsyncResult<void, ServerError> {
    const result = await wrapAsyncCall(() =>
      this.db.session.delete({
        where: { sessionId },
      }),
    )
    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    return success(undefined)
  }
}
