import { AsyncResult, Nullable } from '@/common/types/utility'
import User from '../model/user'

export interface UserRepository {
  create(): AsyncResult<User, Error>
  findById(userId: bigint): AsyncResult<Nullable<User>, Error>
  delete(userId: bigint): AsyncResult<void, Error>
}
