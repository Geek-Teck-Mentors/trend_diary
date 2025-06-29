import { User as PrismaUser } from '@prisma/client'
import { AsyncResult, Nullable, resultError, resultSuccess } from '@/common/types/utility'
import { RdbClient } from '@/infrastructure/rdb'
import User from '../model/user'
import { UserRepository } from '../repository/userRepository'

export default class UserRepositoryImpl implements UserRepository {
  constructor(private db: RdbClient) {}

  async create(accountId: bigint, displayName?: string): AsyncResult<User, Error> {
    try {
      const newUser = await this.db.user.create({
        data: {
          accountId,
          displayName,
        },
      })

      return resultSuccess(
        new User(
          newUser.userId,
          newUser.accountId,
          newUser.displayName ?? undefined,
          newUser.createdAt,
          newUser.updatedAt,
        ),
      )
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findByAccountId(accountId: bigint): AsyncResult<Nullable<User>, Error> {
    try {
      const user = await this.db.user.findFirst({
        where: {
          accountId,
          deletedAt: null,
        },
      })

      if (!user) return resultSuccess(null)

      return resultSuccess(
        new User(
          user.userId,
          user.accountId,
          user.displayName ?? undefined,
          user.createdAt,
          user.updatedAt,
        ),
      )
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findBySessionId(sessionId: string): AsyncResult<Nullable<User>, Error> {
    const currentTimestamp = new Date()
    try {
      const result = await this.db.$queryRaw<PrismaUser[]>`
      SELECT
        users.user_id AS "userId",
        users.account_id AS "accountId",
        users.display_name AS "displayName",
        users.created_at AS "createdAt",
        users.updated_at AS "updatedAt"
      FROM
        users
        INNER JOIN sessions ON users.account_id = sessions.account_id
        AND sessions.session_id = ${sessionId}
      WHERE
        users.deleted_at IS NULL
        AND sessions.expires_at > ${currentTimestamp}`
      if (result.length === 0) return resultSuccess(null)

      const user = result.at(0)
      if (!user) return resultSuccess(null)

      return resultSuccess(
        new User(
          user.userId,
          user.accountId,
          user.displayName ?? undefined,
          user.createdAt,
          user.updatedAt,
        ),
      )
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
