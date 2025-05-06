import { RdbClient } from '@/infrastructure/rdb';
import { UserRepository } from '../account/repository/userRepository';
import User from '../account/model/user';

export default class UserRepositoryImpl implements UserRepository {
  constructor(private db: RdbClient) {}

  async createUser(accountId: bigint, displayName?: string): Promise<User> {
    const newUser = await this.db.user.create({
      data: {
        accountId,
        displayName,
      },
    });

    return new User(
      newUser.userId,
      newUser.accountId,
      newUser.displayName ?? undefined,
      newUser.createdAt,
      newUser.updatedAt,
    );
  }
}
