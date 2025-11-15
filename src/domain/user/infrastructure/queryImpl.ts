import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { Nullable } from '@/common/types/utility'
import { RdbClient } from '@/infrastructure/rdb'
import { Query } from '../repository'
import type { ActiveUser } from '../schema/activeUserSchema'
import { mapToActiveUser } from './mapper'

export default class QueryImpl implements Query {
  constructor(private readonly db: RdbClient) {}

  async findActiveById(id: bigint): AsyncResult<Nullable<ActiveUser>, Error> {
    const activeUserResult = await wrapAsyncCall(() =>
      this.db.activeUser.findUnique({
        where: { activeUserId: id },
      }),
    )
    if (isFailure(activeUserResult)) {
      return failure(new ServerError(activeUserResult.error))
    }

    const activeUser = activeUserResult.data
    if (!activeUser) {
      return success(null)
    }

    return success(mapToActiveUser(activeUser))
  }

  async findActiveByEmail(email: string): AsyncResult<Nullable<ActiveUser>, Error> {
    const activeUserResult = await wrapAsyncCall(() =>
      this.db.activeUser.findUnique({
        where: { email },
      }),
    )
    if (isFailure(activeUserResult)) {
      return failure(new ServerError(activeUserResult.error))
    }

    const activeUser = activeUserResult.data
    if (!activeUser) {
      return success(null)
    }

    return success(mapToActiveUser(activeUser))
  }

  async findActiveBySessionId(sessionId: string): AsyncResult<Nullable<ActiveUser>, Error> {
    const sessionResult = await wrapAsyncCall(() =>
      this.db.session.findFirst({
        where: {
          sessionId,
          expiresAt: { gt: new Date() },
        },
        include: { activeUser: { include: { adminUser: true } } },
      }),
    )
    if (isFailure(sessionResult)) {
      return failure(new ServerError(sessionResult.error))
    }

    const session = sessionResult.data
    if (!session) {
      return success(null)
    }

    return success(mapToActiveUser(session.activeUser))
  }

  async findActiveByAuthenticationId(
    authenticationId: string,
  ): AsyncResult<Nullable<ActiveUser>, Error> {
    const activeUserResult = await wrapAsyncCall(() =>
      this.db.activeUser.findUnique({
        where: { authenticationId },
        include: { adminUser: true },
      }),
    )
    if (isFailure(activeUserResult)) {
      return failure(new ServerError(activeUserResult.error))
    }

    const activeUser = activeUserResult.data
    if (!activeUser) {
      return success(null)
    }

    return success(mapToActiveUser(activeUser))
  }
}
