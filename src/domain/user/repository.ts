import type { ClientError, ServerError } from '@/common/errors'
import type { AsyncResult, Nullable } from '@/common/types/utility'
import type { User } from './schema/userSchema'

export interface UserQueryRepository {
  findById(id: bigint): AsyncResult<Nullable<User>, ClientError | ServerError>
  findBySupabaseId(supabaseId: string): AsyncResult<Nullable<User>, ClientError | ServerError>
}

export interface UserCommandRepository {
  create(data: { supabaseId: string }): AsyncResult<User, ClientError | ServerError>
}
