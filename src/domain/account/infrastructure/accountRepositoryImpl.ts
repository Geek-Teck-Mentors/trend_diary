import { Prisma, Account as PrismaAccount } from '@prisma/client'
import { AlreadyExistsError } from '@/common/errors'
import { AsyncResult, Nullable, resultError, resultSuccess } from '@/common/types/utility'
import { RdbClient } from '@/infrastructure/rdb'
import Account from '../model/account'
import { AccountRepository } from '../repository/accountRepository'

export default class AccountRepositoryImpl implements AccountRepository {
  constructor(private db: RdbClient) {}

  async createAccount(email: string, hashedPassword: string): AsyncResult<Account, Error> {
    try {
      const account = await this.db.account.create({
        data: {
          email,
          password: hashedPassword,
        },
      })

      return resultSuccess(
        new Account(
          account.accountId,
          account.email,
          account.password,
          account.lastLogin ?? undefined,
          account.createdAt,
          account.updatedAt,
          account.deletedAt ?? undefined,
        ),
      )
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return resultError(new AlreadyExistsError(error.message))
        }
      }
      return resultError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findById(accountId: bigint): AsyncResult<Nullable<Account>, Error> {
    try {
      const account = await this.db.account.findUnique({
        where: {
          accountId,
        },
      })

      if (!account) return resultSuccess(null)

      return resultSuccess(
        new Account(
          account.accountId,
          account.email,
          account.password,
          account.lastLogin ?? undefined,
          account.createdAt,
          account.updatedAt,
          account.deletedAt ?? undefined,
        ),
      )
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findByEmail(email: string): AsyncResult<Nullable<Account>, Error> {
    try {
      const account = await this.db.account.findUnique({
        where: {
          email,
        },
      })

      if (!account) return resultSuccess(null)

      return resultSuccess(
        new Account(
          account.accountId,
          account.email,
          account.password,
          account.lastLogin ?? undefined,
          account.createdAt,
          account.updatedAt,
          account.deletedAt ?? undefined,
        ),
      )
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findBySessionId(sessionId: string): AsyncResult<Nullable<Account>, Error> {
    try {
      const result = await this.db.$queryRaw<PrismaAccount[]>`
      SELECT
        accounts.account_id AS "accountId",
        accounts.email AS "email",
        accounts.last_login AS "lastLogin",
        accounts.created_at AS "createdAt",
        accounts.updated_at AS "updatedAt"
      FROM
        accounts
        INNER JOIN sessions ON accounts.account_id = sessions.account_id
      WHERE
        accounts.deleted_at IS NULL
        AND sessions.session_id = ${sessionId}`

      if (result.length === 0) return resultSuccess(null)

      const account = result.at(0)
      if (!account) return resultSuccess(null)

      return resultSuccess(
        new Account(
          account.accountId,
          account.email,
          '',
          account.lastLogin ?? undefined,
          account.createdAt,
          account.updatedAt,
        ),
      )
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async save(account: Account): AsyncResult<Account, Error> {
    try {
      const updatedAccount = await this.db.account.update({
        where: {
          accountId: account.accountId,
        },
        data: {
          email: account.email,
          password: account.password,
          lastLogin: account.lastLogin,
          updatedAt: new Date(),
        },
      })

      return resultSuccess(
        new Account(
          updatedAccount.accountId,
          updatedAccount.email,
          updatedAccount.password,
          updatedAccount.lastLogin ?? undefined,
          updatedAccount.createdAt,
          updatedAccount.updatedAt,
          updatedAccount.deletedAt ?? undefined,
        ),
      )
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async delete(account: Account): AsyncResult<Account, Error> {
    try {
      const updatedAccount = await this.db.account.update({
        where: {
          accountId: account.accountId,
        },
        data: {
          deletedAt: new Date(),
        },
      })

      return resultSuccess(
        new Account(
          updatedAccount.accountId,
          updatedAccount.email,
          updatedAccount.password,
          updatedAccount.lastLogin ?? undefined,
          updatedAccount.createdAt,
          updatedAccount.updatedAt,
          updatedAccount.deletedAt ?? undefined,
        ),
      )
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async addSession(accountId: bigint, expiresAt: Date): AsyncResult<string, Error> {
    try {
      const session = await this.db.session.create({
        data: {
          accountId,
          expiresAt,
        },
      })

      return resultSuccess(session.sessionId)
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async removeSession(sessionId: string): AsyncResult<void, Error> {
    try {
      await this.db.session.delete({
        where: {
          sessionId,
        },
      })

      return resultSuccess(undefined)
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
