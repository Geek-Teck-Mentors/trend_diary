import { User as PrismaUser } from '@prisma/client';
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
    const user = await this.db.user.findFirst({
      where: {
        accountId,
        deletedAt: null,
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

  async findBySessionId(sessionId: string): Promise<Nullable<User>> {
    const result = await this.db.$queryRaw<PrismaUser[]>`
    SELECT
      users.user_id,
      users.account_id,
      users.display_name,
      users.created_at,
      users.updated_at
    FROM
      users
      INNER JOIN sessions ON users.account_id = sessions.account_id
      AND sessions.session_id = ${sessionId}
    WHERE
      users.deleted_at IS NULL
      AND sessions.expires_at > ${new Date()}`;

    if (result.length === 0) return null;

    const user = result.at(0);
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
