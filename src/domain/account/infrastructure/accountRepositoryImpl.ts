import { Prisma, Account as PrismaAccount } from '@prisma/client';
import { Nullable } from '@/common/types/utility';
import { RdbClient, TransactionManager } from '@/infrastructure/rdb';
import { AlreadyExistsError } from '@/common/errors';

import { AccountRepository } from '../repository/accountRepository';
import Account from '../model/account';

export default class AccountRepositoryImpl extends TransactionManager implements AccountRepository {
  constructor(private db: RdbClient) {
    super(db);
  }

  async createAccount(email: string, hashedPassword: string): Promise<Account> {
    try {
      const account = await this.db.account.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      return new Account(
        account.accountId,
        account.email,
        account.password,
        account.lastLogin ?? undefined,
        account.createdAt,
        account.updatedAt,
        account.deletedAt ?? undefined,
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AlreadyExistsError(error.message);
        }
      }
      throw error;
    }
  }

  async findById(accountId: bigint): Promise<Nullable<Account>> {
    const account = await this.db.account.findUnique({
      where: {
        accountId,
      },
    });

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
  }

  async findByEmail(email: string): Promise<Nullable<Account>> {
    const account = await this.db.account.findUnique({
      where: {
        email,
      },
    });

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
  }

  async findBySessionId(sessionId: string): Promise<Nullable<Account>> {
    const result = await this.db.$queryRaw<PrismaAccount[]>`
    SELECT
      accounts.account_id,
      accounts.email,
      accounts.last_login,
      accounts.created_at,
      accounts.updated_at,
      accounts.deleted_at
    FROM
      accounts
      INNER JOIN sessions ON accounts.account_id = sessions.account_id
      AND sessions.session_id = ${sessionId}
    WHERE
      accounts.deleted_at IS NULL`;
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

  async save(account: Account): Promise<Account> {
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
    });

    return new Account(
      updatedAccount.accountId,
      updatedAccount.email,
      updatedAccount.password,
      updatedAccount.lastLogin ?? undefined,
      updatedAccount.createdAt,
      updatedAccount.updatedAt,
      updatedAccount.deletedAt ?? undefined,
    );
  }

  async delete(account: Account): Promise<Account> {
    const updatedAccount = await this.db.account.update({
      where: {
        accountId: account.accountId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return new Account(
      updatedAccount.accountId,
      updatedAccount.email,
      updatedAccount.password,
      updatedAccount.lastLogin ?? undefined,
      updatedAccount.createdAt,
      updatedAccount.updatedAt,
      updatedAccount.deletedAt ?? undefined,
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
