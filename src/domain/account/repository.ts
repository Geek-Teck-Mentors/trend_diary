import { Nullable } from '../../common/typeUtility';
import UUID from '../../common/uuid';
import { TransactionClient } from '../../infrastructure/rdb';
import User from '../user/user';
import Account from './account';

export interface AccountRepository extends TransactionClient {
  createAccount(email: string, hashedPassword: string): Promise<Account>;
  findById(accountId: UUID): Promise<Nullable<Account>>;
  findByEmail(email: string): Promise<Nullable<Account>>;
  save(account: Account): Promise<Account>;
  delete(account: Account): Promise<void>;
}

export interface UserRepository {
  createUser(accountId: UUID, displayName?: string): Promise<User>;
}
