import { Prisma } from '@prisma/client'
import { AlreadyExistsError } from '@/common/errors'
import { AsyncResult, Nullable, resultError, resultSuccess } from '@/common/types/utility'
import { RdbClient } from '@/infrastructure/rdb'
import ActiveUser from '../model/activeUser'
import { ActiveUserRepository } from '../repository/activeUserRepository'
import { ActiveUserUpdate } from '../schema/activeUserSchema'

export default class ActiveUserRepositoryImpl implements ActiveUserRepository {
  constructor(private db: RdbClient) {}

  private mapToActiveUser(activeUser: {
    activeUserId: bigint
    userId: bigint
    email: string
    password: string
    displayName: string | null
    lastLogin: Date | null
    createdAt: Date
    updatedAt: Date
  }): ActiveUser {
    return new ActiveUser(
      activeUser.activeUserId,
      activeUser.userId,
      activeUser.email,
      activeUser.password,
      activeUser.displayName,
      activeUser.lastLogin ?? undefined,
      activeUser.createdAt,
      activeUser.updatedAt,
    )
  }

  async createActiveUser(
    userId: bigint,
    email: string,
    hashedPassword: string,
    displayName?: string,
  ): AsyncResult<ActiveUser, Error> {
    try {
      const activeUser = await this.db.activeUser.create({
        data: {
          userId,
          email,
          password: hashedPassword,
          displayName,
        },
      })

      return resultSuccess(this.mapToActiveUser(activeUser))
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return resultError(new AlreadyExistsError(`Email ${email} already exists`))
      }
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }

  async findById(activeUserId: bigint): AsyncResult<Nullable<ActiveUser>, Error> {
    try {
      const activeUser = await this.db.activeUser.findUnique({
        where: { activeUserId },
      })

      if (!activeUser) {
        return resultSuccess(null)
      }

      return resultSuccess(this.mapToActiveUser(activeUser))
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }

  async findByUserId(userId: bigint): AsyncResult<Nullable<ActiveUser>, Error> {
    try {
      const activeUser = await this.db.activeUser.findUnique({
        where: { userId },
      })

      if (!activeUser) {
        return resultSuccess(null)
      }

      return resultSuccess(this.mapToActiveUser(activeUser))
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }

  async findByEmail(email: string): AsyncResult<Nullable<ActiveUser>, Error> {
    try {
      const activeUser = await this.db.activeUser.findUnique({
        where: { email },
      })

      if (!activeUser) {
        return resultSuccess(null)
      }

      return resultSuccess(this.mapToActiveUser(activeUser))
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }

  async findBySessionId(sessionId: string): AsyncResult<Nullable<ActiveUser>, Error> {
    try {
      const session = await this.db.session.findUnique({
        where: { sessionId },
        include: { activeUser: true },
      })

      if (!session || !session.activeUser) {
        return resultSuccess(null)
      }

      const activeUser = session.activeUser
      return resultSuccess(this.mapToActiveUser(activeUser))
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }

  async update(activeUserId: bigint, updates: ActiveUserUpdate): AsyncResult<ActiveUser, Error> {
    try {
      const activeUser = await this.db.activeUser.update({
        where: { activeUserId },
        data: updates,
      })

      return resultSuccess(this.mapToActiveUser(activeUser))
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }

  async delete(activeUser: ActiveUser): AsyncResult<ActiveUser, Error> {
    try {
      await this.db.activeUser.delete({
        where: { activeUserId: activeUser.activeUserId },
      })
      return resultSuccess(activeUser)
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }

  async save(activeUser: ActiveUser): AsyncResult<ActiveUser, Error> {
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

      return resultSuccess(this.mapToActiveUser(updatedActiveUser))
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
