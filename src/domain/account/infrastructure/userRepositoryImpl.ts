import { ResultAsync } from 'neverthrow';
import { User as PrismaUser } from '@prisma/client';
import { RdbClient } from '@/infrastructure/rdb';
import { UserRepository } from '../repository/userRepository';
import User from '../model/user';
import { Nullable } from '@/common/types/utility';

export default class UserRepositoryImpl implements UserRepository {
  constructor(private db: RdbClient) {}

  create(accountId: bigint, displayName?: string): ResultAsync<User, Error> {
    return ResultAsync.fromPromise(
      this.db.user.create({
        data: {
          accountId,
          displayName,
        },
      }),
      (error) => (error instanceof Error ? error : new Error(String(error))),
    ).map(
      (newUser) =>
        new User(
          newUser.userId,
          newUser.accountId,
          newUser.displayName ?? undefined,
          newUser.createdAt,
          newUser.updatedAt,
        ),
    );
  }

  findByAccountId(accountId: bigint): ResultAsync<Nullable<User>, Error> {
    return ResultAsync.fromPromise(
      this.db.user.findFirst({
        where: {
          accountId,
          deletedAt: null,
        },
      }),
      (error) => (error instanceof Error ? error : new Error(String(error))),
    ).map((user) => {
      if (!user) return null;

      return new User(
        user.userId,
        user.accountId,
        user.displayName ?? undefined,
        user.createdAt,
        user.updatedAt,
      );
    });
  }

  findBySessionId(sessionId: string): ResultAsync<Nullable<User>, Error> {
    return ResultAsync.fromPromise(
      this.db.$queryRaw<PrismaUser[]>`
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
        AND sessions.expires_at > ${new Date()}`,
      (error) => (error instanceof Error ? error : new Error(String(error))),
    ).map((result) => {
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
    });
  }
}
