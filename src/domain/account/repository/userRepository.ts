import { AsyncResult, Nullable } from '@/common/types/utility';
import User from '../model/user';

export interface UserRepository {
  create(accountId: bigint, displayName?: string): AsyncResult<User, Error>;
  findByAccountId(accountId: bigint): AsyncResult<Nullable<User>, Error>;
  findBySessionId(sessionId: string): AsyncResult<Nullable<User>, Error>;
}
