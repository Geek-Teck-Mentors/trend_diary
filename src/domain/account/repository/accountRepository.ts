import { ResultAsync } from 'neverthrow';
import { Nullable } from '../../../common/types/utility';
import { TransactionClient } from '../../../infrastructure/rdb';
import Account from '../model/account';

export interface AccountRepository extends TransactionClient {
  createAccount(email: string, hashedPassword: string): ResultAsync<Account, Error>;
  findById(accountId: bigint): ResultAsync<Nullable<Account>, Error>;
  findByEmail(email: string): ResultAsync<Nullable<Account>, Error>;
  save(account: Account): ResultAsync<Account, Error>;
  delete(account: Account): ResultAsync<Account, Error>;
}
