import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { Nullable } from '@/common/types/utility'
import { RdbClient } from '@/infrastructure/rdb'
import { Query } from '../repository'
import type { ActiveUser, CurrentUser } from '../schema/active-user-schema'
import { mapToActiveUser } from './mapper'

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
