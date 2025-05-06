import User from '../account/model/user';

export interface UserRepository {
  createUser(accountId: bigint, displayName?: string): Promise<User>;
}
