import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { Nullable } from '@/common/types/utility'
import { RdbClient } from '@/infrastructure/rdb'
import { Query } from '../repository'
import type { ActiveUser } from '../schema/activeUserSchema'
import { mapToActiveUser } from './mapper'

export default class QueryImpl implements Query {
  constructor(private readonly db: RdbClient) {}

  async findActiveById(id: bigint): AsyncResult<Nullable<ActiveUser>, Error> {
    try {
      const activeUser = await this.db.activeUser.findUnique({
        where: { activeUserId: id },
      })

      if (!activeUser) {
        return success(null)
      }

      return success(mapToActiveUser(activeUser))
    } catch (error) {
      return failure(new ServerError(error))
    }
  }

  async findActiveByEmail(email: string): AsyncResult<Nullable<ActiveUser>, Error> {
    try {
      const activeUser = await this.db.activeUser.findUnique({
        where: { email },
      })

      if (!activeUser) {
        return success(null)
      }

      return success(mapToActiveUser(activeUser))
    } catch (error) {
      return failure(new ServerError(error))
    }
  }

  async findActiveBySessionId(sessionId: string): AsyncResult<Nullable<ActiveUser>, Error> {
    try {
      const session = await this.db.session.findFirst({
        where: {
          sessionId,
          expiresAt: { gt: new Date() },
        },
        include: { activeUser: { include: { adminUser: true } } },
      })

      if (!session) {
        return success(null)
      }

      return success(mapToActiveUser(session.activeUser))
    } catch (error) {
      return failure(new ServerError(error))
    }
  }

  async findActiveByAuthenticationId(
    authenticationId: string,
  ): AsyncResult<Nullable<ActiveUser>, Error> {
    try {
      const activeUser = await this.db.activeUser.findUnique({
        where: { authenticationId },
        include: { adminUser: true },
      })

      if (!activeUser) {
        return resultSuccess(null)
      }

      return resultSuccess(mapToActiveUser(activeUser))
    } catch (error) {
      return resultError(new ServerError(error))
    }
  }
}
