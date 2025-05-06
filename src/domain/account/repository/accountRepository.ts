import { Nullable } from '../../../common/typeUtility';
import { TransactionClient } from '../../../infrastructure/rdb';
import Account from '../model/account';

export interface AccountRepository extends TransactionClient {
  createAccount(email: string, hashedPassword: string): Promise<Account>;
  findById(accountId: bigint): Promise<Nullable<Account>>;
  findByEmail(email: string): Promise<Nullable<Account>>;
  save(account: Account): Promise<Account>;
  delete(account: Account): Promise<Account>;
}
