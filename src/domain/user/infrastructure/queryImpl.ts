import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { Nullable } from '@/common/types/utility'
import { RdbClient } from '@/infrastructure/rdb'
import { Query } from '../repository'
import type { ActiveUser, CurrentUser } from '../schema/activeUserSchema'
import { mapToActiveUser } from './mapper'
import { hasAdminPermissions } from './permissionChecker'

export default class QueryImpl implements Query {
  constructor(private readonly db: RdbClient) {}

  async findActiveById(id: bigint): AsyncResult<Nullable<CurrentUser>, Error> {
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

  async findActiveByEmail(email: string): AsyncResult<Nullable<CurrentUser>, Error> {
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

  async findActiveByEmailForAuth(email: string): AsyncResult<Nullable<ActiveUser>, Error> {
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

    return success({
      activeUserId: activeUser.activeUserId,
      userId: activeUser.userId,
      email: activeUser.email,
      password: activeUser.password,
      displayName: activeUser.displayName,
      authenticationId: activeUser.authenticationId ?? undefined,
      lastLogin: activeUser.lastLogin ?? undefined,
      createdAt: activeUser.createdAt,
      updatedAt: activeUser.updatedAt,
    })
  }

  async findActiveBySessionId(
    sessionId: string,
  ): AsyncResult<Nullable<CurrentUser & { hasAdminAccess: boolean }>, Error> {
    const sessionResult = await wrapAsyncCall(() =>
      this.db.session.findFirst({
        where: {
          sessionId,
          expiresAt: { gt: new Date() },
        },
        include: { activeUser: true },
      }),
    )
    if (isFailure(sessionResult)) {
      return failure(new ServerError(sessionResult.error))
    }

    const session = sessionResult.data
    if (!session) {
      return success(null)
    }

    const hasAdminAccess = await hasAdminPermissions(this.db, session.activeUser.activeUserId)

    const activeUserWithoutPassword = mapToActiveUser(session.activeUser)
    return success({
      ...activeUserWithoutPassword,
      hasAdminAccess,
    })
  }

  async findActiveByAuthenticationId(
    authenticationId: string,
  ): AsyncResult<Nullable<CurrentUser>, Error> {
    const activeUserResult = await wrapAsyncCall(() =>
      this.db.activeUser.findUnique({
        where: { authenticationId },
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
