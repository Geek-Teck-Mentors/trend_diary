import { ServerError } from '@/common/errors'
import { AsyncResult, resultError, resultSuccess } from '@/common/types/utility'
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

      return resultSuccess(mapToActiveUser(activeUser))
    } catch (error) {
      return resultError(new ServerError(error))
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

      return resultSuccess(mapToActiveUser(updatedActiveUser))
    } catch (error) {
      return resultError(new ServerError(error))
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

      return resultSuccess({
        sessionId: session.sessionId,
        expiresAt: session.expiresAt,
      })
    } catch (error) {
      return resultError(new ServerError(error))
    }
  }

  async deleteSession(sessionId: string): AsyncResult<void, Error> {
    try {
      await this.db.session.delete({
        where: { sessionId },
      })

      return resultSuccess(undefined)
    } catch (error) {
      return resultError(new ServerError(error))
    }
  }
}
