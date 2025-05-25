import { ResultAsync } from 'neverthrow';
import { Nullable } from '../../../common/types/utility';
import Account from '../model/account';

export interface AccountRepository {
  createAccount(email: string, hashedPassword: string): ResultAsync<Account, Error>;
  findById(accountId: bigint): ResultAsync<Nullable<Account>, Error>;
  findByEmail(email: string): ResultAsync<Nullable<Account>, Error>;
  findBySessionId(sessionId: string): Promise<Nullable<Account>>;
  save(account: Account): ResultAsync<Account, Error>;
  delete(account: Account): ResultAsync<Account, Error>;
  addSession(accountId: bigint, expiresAt: Date): Promise<string>;
  removeSession(sessionId: string): Promise<void>;
}
