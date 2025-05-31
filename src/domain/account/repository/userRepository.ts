import { ResultAsync } from 'neverthrow';
import { Nullable } from '@/common/types/utility';
import User from '../model/user';

export interface UserRepository {
  create(accountId: bigint, displayName?: string): ResultAsync<User, Error>;
  findByAccountId(accountId: bigint): ResultAsync<Nullable<User>, Error>;
  findBySessionId(sessionId: string): ResultAsync<Nullable<User>, Error>;
}
