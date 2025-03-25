import { Nullable } from '../../../common/typeUtility';
import { RdbClient } from '../../../infrastructure/rdb';
import Account from '../account';
import { AccountRepository } from '../repository';

export default class AccountRepositoryImpl implements AccountRepository {
  constructor(private db: RdbClient) {}

  begin(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  commit(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  rollback(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  transaction<T>(fn: () => Promise<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }

  async createAccount(email: string, hashedPassword: string): Promise<Account> {
    throw new Error('Method not implemented.');
  }

  async findById(accountId: UUID): Promise<Nullable<Account>> {
    throw new Error('Method not implemented.');
  }

  async findByEmail(email: string): Promise<Nullable<Account>> {
    throw new Error('Method not implemented.');
  }

  async save(account: Account): Promise<Account> {
    throw new Error('Method not implemented.');
  }

  async delete(account: Account): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
