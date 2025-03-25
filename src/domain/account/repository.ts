import { Nullable } from '../../common/typeUtility';
import UUID from '../../common/uuid';
import User from '../user/user';
import Account from './account';

export interface AccountRepository {
  createAccount(email: string, hashedPassword: string): Promise<Account>;
  findById(accountId: UUID): Promise<Nullable<Account>>;
  findByEmail(email: string): Promise<Nullable<Account>>;
  save(account: Account): Promise<Account>;
  delete(account: Account): Promise<void>;
}

export interface UserRepository {
  findById(userId: UUID): Promise<Nullable<User>>;
  createUser(accountId: UUID, displayName?: string): Promise<User>;
}
