import { Nullable } from '../../common/typeUtility';
import { TransactionClient } from '../../infrastructure/rdb';
import User from '../user/user';
import Account from './account';

export interface AccountRepository extends TransactionClient {
  createAccount(email: string, hashedPassword: string): Promise<Account>;
  findById(accountId: bigint): Promise<Nullable<Account>>;
  findByEmail(email: string): Promise<Nullable<Account>>;
  save(account: Account): Promise<Account>;
  delete(account: Account): Promise<Account>;
}

export interface UserRepository {
  createUser(accountId: bigint, displayName?: string): Promise<User>;
}
