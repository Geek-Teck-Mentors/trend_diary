import { Prisma } from '@prisma/client';
import { getAccountBySessionId } from '@prisma/client/sql';
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
    const result = await this.db.$queryRawTyped(getAccountBySessionId(sessionId));
    if (result.length === 0) return null;

    const account = result.at(0);
    if (!account) return null;

    return new Account(
      account.account_id,
      account.email,
      '',
      account.last_login ?? undefined,
      account.created_at,
      account.updated_at,
      account.deleted_at ?? undefined,
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

  async addSession(accountId: bigint, expiresAt: Date): Promise<void> {
    await this.db.session.create({
      data: {
        accountId,
        expiresAt,
      },
    });
  }

  async removeSession(sessionId: string): Promise<void> {
    await this.db.session.delete({
      where: {
        sessionId,
      },
    });
  }
}
