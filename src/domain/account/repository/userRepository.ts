import { Nullable } from '@/common/types/utility';
import User from '../model/user';

export interface UserRepository {
  create(accountId: bigint, displayName?: string): Promise<User>;
  findByAccountId(accountId: bigint): Promise<Nullable<User>>;
  findBySessionId(sessionId: string): Promise<Nullable<User>>;
}
