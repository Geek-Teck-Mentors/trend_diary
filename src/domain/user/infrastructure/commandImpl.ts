import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { RdbClient } from '@/infrastructure/rdb'
import { CreateSessionInput } from '../dto'
import { Command } from '../repository'
import type { ActiveUser } from '../schema/activeUserSchema'
import { mapToActiveUser } from './mapper'

export default class CommandImpl implements Command {
  constructor(private readonly db: RdbClient) {}

  async createActive(email: string, hashedPassword: string): AsyncResult<ActiveUser, Error> {
    try {
      const activeUser = await this.db.$transaction(async (tx: any) => {
        const user = await tx.user.create({})
        const activeUser = await tx.activeUser.create({
          data: {
            userId: user.userId,
            email,
            password: hashedPassword,
          },
        })
        return activeUser
      })

      return success(mapToActiveUser(activeUser))
    } catch (error) {
      return failure(new ServerError(error))
    }
  }

  async createActiveWithAuthenticationId(
    email: string,
    hashedPassword: string,
    authenticationId: string,
    displayName?: string | null,
  ): AsyncResult<ActiveUser, Error> {
    try {
      const activeUser = await this.db.$transaction(async (tx: any) => {
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
      })

      return resultSuccess(mapToActiveUser(activeUser))
    } catch (error) {
      return resultError(new ServerError(error))
    }
  }

  async saveActive(activeUser: ActiveUser): AsyncResult<ActiveUser, Error> {
    try {
      const updatedActiveUser = await this.db.activeUser.update({
        where: { activeUserId: activeUser.activeUserId },
        data: {
          email: activeUser.email,
          password: activeUser.password,
          displayName: activeUser.displayName,
          lastLogin: activeUser.lastLogin,
        },
      })

      return success(mapToActiveUser(updatedActiveUser))
    } catch (error) {
      return failure(new ServerError(error))
    }
  }

  async createSession(
    input: CreateSessionInput,
  ): AsyncResult<{ sessionId: string; expiresAt: Date }, Error> {
    try {
      const session = await this.db.session.create({
        data: {
          sessionId: input.sessionId,
          activeUserId: input.activeUserId,
          sessionToken: input.sessionToken,
          expiresAt: input.expiresAt,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      })

      return success({
        sessionId: session.sessionId,
        expiresAt: session.expiresAt,
      })
    } catch (error) {
      return failure(new ServerError(error))
    }
  }

  async deleteSession(sessionId: string): AsyncResult<void, Error> {
    try {
      await this.db.session.delete({
        where: { sessionId },
      })

      return success(undefined)
    } catch (error) {
      return failure(new ServerError(error))
    }
  }
}
