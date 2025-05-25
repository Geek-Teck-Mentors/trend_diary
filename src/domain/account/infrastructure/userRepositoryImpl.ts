import { ResultAsync } from 'neverthrow';
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
}
