import { Prisma, Account as PrismaAccount } from '@prisma/client';
import { ResultAsync } from 'neverthrow';
import { Nullable } from '@/common/types/utility';
import { RdbClient } from '@/infrastructure/rdb';
import { AlreadyExistsError } from '@/common/errors';

import { AccountRepository } from '../repository/accountRepository';
import Account from '../model/account';

export default class AccountRepositoryImpl implements AccountRepository {
  constructor(private db: RdbClient) {}

  createAccount(email: string, hashedPassword: string): ResultAsync<Account, Error> {
    return ResultAsync.fromPromise(
      this.db.account.create({
        data: {
          email,
          password: hashedPassword,
        },
      }),
      (error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            return new AlreadyExistsError(error.message);
          }
        }
        return error instanceof Error ? error : new Error(String(error));
      },
    ).map(
      (account) =>
        new Account(
          account.accountId,
          account.email,
          account.password,
          account.lastLogin ?? undefined,
          account.createdAt,
          account.updatedAt,
          account.deletedAt ?? undefined,
        ),
    );
  }

  findById(accountId: bigint): ResultAsync<Nullable<Account>, Error> {
    return ResultAsync.fromPromise(
      this.db.account.findUnique({
        where: {
          accountId,
        },
      }),
      (error) => (error instanceof Error ? error : new Error(String(error))),
    ).map((account) => {
      if (!account) return null;

      return new Account(
        account.accountId,
        account.email,
        account.password,
        account.lastLogin ?? undefined,
        account.createdAt,
        account.updatedAt,
        account.deletedAt ?? undefined,
      );
    });
  }

  findByEmail(email: string): ResultAsync<Nullable<Account>, Error> {
    return ResultAsync.fromPromise(
      this.db.account.findUnique({
        where: {
          email,
        },
      }),
      (error) => (error instanceof Error ? error : new Error(String(error))),
    ).map((account) => {
      if (!account) return null;

      return new Account(
        account.accountId,
        account.email,
        account.password,
        account.lastLogin ?? undefined,
        account.createdAt,
        account.updatedAt,
        account.deletedAt ?? undefined,
      );
    });
  }

  async findBySessionId(sessionId: string): Promise<Nullable<Account>> {
    const result = await this.db.$queryRaw<PrismaAccount[]>`
    SELECT
      accounts.account_id,
      accounts.email,
      accounts.last_login,
      accounts.created_at,
      accounts.updated_at
    FROM
      accounts
      INNER JOIN sessions ON accounts.account_id = sessions.account_id
    WHERE
      accounts.deleted_at IS NULL
      AND sessions.session_id = ${sessionId}`;
    if (result.length === 0) return null;

    const account = result.at(0);
    if (!account) return null;

    return new Account(
      account.accountId,
      account.email,
      '',
      account.lastLogin ?? undefined,
      account.createdAt,
      account.updatedAt,
    );
  }

  save(account: Account): ResultAsync<Account, Error> {
    return ResultAsync.fromPromise(
      this.db.account.update({
        where: {
          accountId: account.accountId,
        },
        data: {
          email: account.email,
          password: account.password,
          lastLogin: account.lastLogin,
          updatedAt: new Date(),
        },
      }),
      (error) => (error instanceof Error ? error : new Error(String(error))),
    ).map(
      (updatedAccount) =>
        new Account(
          updatedAccount.accountId,
          updatedAccount.email,
          updatedAccount.password,
          updatedAccount.lastLogin ?? undefined,
          updatedAccount.createdAt,
          updatedAccount.updatedAt,
          updatedAccount.deletedAt ?? undefined,
        ),
    );
  }

  delete(account: Account): ResultAsync<Account, Error> {
    return ResultAsync.fromPromise(
      this.db.account.update({
        where: {
          accountId: account.accountId,
        },
        data: {
          deletedAt: new Date(),
        },
      }),
      (error) => (error instanceof Error ? error : new Error(String(error))),
    ).map(
      (updatedAccount) =>
        new Account(
          updatedAccount.accountId,
          updatedAccount.email,
          updatedAccount.password,
          updatedAccount.lastLogin ?? undefined,
          updatedAccount.createdAt,
          updatedAccount.updatedAt,
          updatedAccount.deletedAt ?? undefined,
        ),
    );
  }

  async addSession(accountId: bigint, expiresAt: Date): Promise<string> {
    const session = await this.db.session.create({
      data: {
        accountId,
        expiresAt,
      },
    });

    return session.sessionId;
  }

  async removeSession(sessionId: string): Promise<void> {
    await this.db.session.delete({
      where: {
        sessionId,
      },
    });
  }
}
