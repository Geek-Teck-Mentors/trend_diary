import { RdbClient } from '@/infrastructure/rdb';
import { UserRepository } from '../repository/userRepository';
import User from '../model/user';
import { Nullable } from '@/common/types/utility';

export default class UserRepositoryImpl implements UserRepository {
  constructor(private db: RdbClient) {}

  async create(accountId: bigint, displayName?: string): Promise<User> {
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

  async findByAccountId(accountId: bigint): Promise<Nullable<User>> {
    const user = await this.db.user.findUnique({
      where: {
        accountId,
      },
    });

    if (!user) return null;

    return new User(
      user.userId,
      user.accountId,
      user.displayName ?? undefined,
      user.createdAt,
      user.updatedAt,
    );
  }
}
