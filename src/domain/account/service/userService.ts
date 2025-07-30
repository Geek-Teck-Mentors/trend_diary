import { NotFoundError, ServerError } from '@/common/errors'
import {
  isError,
  isNull,
  isSuccess,
  Result,
  resultError,
  resultSuccess,
} from '@/common/types/utility'
import User from '../model/user'
import { UserRepository } from '../repository/userRepository'

export default class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(): Promise<Result<User, Error>> {
    const result = await this.userRepository.create()
    if (isError(result)) return resultError(ServerError.handle(result.error))
    return resultSuccess(result.data)
  }

  async findById(userId: bigint): Promise<Result<User | null, Error>> {
    const result = await this.userRepository.findById(userId)
    if (isError(result)) return resultError(ServerError.handle(result.error))
    return resultSuccess(result.data)
  }

  async delete(userId: bigint): Promise<Result<void, Error>> {
    // 存在チェック
    const findResult = await this.userRepository.findById(userId)
    if (isError(findResult)) return resultError(ServerError.handle(findResult.error))
    if (isSuccess(findResult) && isNull(findResult.data))
      return resultError(new NotFoundError('User not found'))

    const result = await this.userRepository.delete(userId)
    if (isError(result)) return resultError(ServerError.handle(result.error))
    return resultSuccess(undefined)
  }
}
