import { AsyncResult, Nullable } from '../../../common/types/utility'
import Account from '../model/account'

export interface AccountRepository {
  createAccount(email: string, hashedPassword: string): AsyncResult<Account, Error>
  findById(accountId: bigint): AsyncResult<Nullable<Account>, Error>
  findByEmail(email: string): AsyncResult<Nullable<Account>, Error>
  findBySessionId(sessionId: string): AsyncResult<Nullable<Account>, Error>
  save(account: Account): AsyncResult<Account, Error>
  delete(account: Account): AsyncResult<Account, Error>
  addSession(accountId: bigint, expiresAt: Date): AsyncResult<string, Error>
  removeSession(sessionId: string): AsyncResult<void, Error>
}
