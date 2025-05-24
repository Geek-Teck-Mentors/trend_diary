import { Prisma } from '@prisma/client';
import { ResultAsync } from 'neverthrow';
import { Nullable } from '@/common/types/utility';
import { RdbClient, TransactionManager } from '@/infrastructure/rdb';
import { AlreadyExistsError } from '@/common/errors';

import { AccountRepository } from '../repository/accountRepository';
import Account from '../model/account';

export default class AccountRepositoryImpl extends TransactionManager implements AccountRepository {
  constructor(private db: RdbClient) {
    super(db);
  }

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
}
