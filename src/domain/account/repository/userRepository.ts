import User from '../model/user';

export interface UserRepository {
  createUser(accountId: bigint, displayName?: string): Promise<User>;
}
