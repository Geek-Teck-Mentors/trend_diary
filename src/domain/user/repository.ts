import User from './user';

export interface UserRepository {
  createUser(accountId: bigint, displayName?: string): Promise<User>;
}
