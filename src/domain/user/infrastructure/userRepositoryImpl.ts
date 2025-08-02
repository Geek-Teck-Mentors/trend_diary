import { AsyncResult, Nullable, resultError, resultSuccess } from '@/common/types/utility'
import { RdbClient } from '@/infrastructure/rdb'
import User from '../model/user'
import { UserRepository } from '../repository/userRepository'

export default class UserRepositoryImpl implements UserRepository {
  constructor(private db: RdbClient) {}

  async create(): AsyncResult<User, Error> {
    try {
      const user = await this.db.user.create({
        data: {
          // userIdとcreatedAtは自動生成
        },
      })

      return resultSuccess(new User(user.userId, user.createdAt))
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }

  async findById(userId: bigint): AsyncResult<Nullable<User>, Error> {
    try {
      const user = await this.db.user.findUnique({
        where: { userId },
      })

      if (!user) {
        return resultSuccess(null)
      }

      return resultSuccess(new User(user.userId, user.createdAt))
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }

  async delete(userId: bigint): AsyncResult<void, Error> {
    try {
      await this.db.user.delete({
        where: { userId },
      })
      return resultSuccess(undefined)
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
