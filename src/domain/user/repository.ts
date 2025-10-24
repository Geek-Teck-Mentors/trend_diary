import type { ClientError, ServerError } from '@/common/errors'
import type { AsyncResult, Nullable } from '@/common/types/utility'
import type { CreateSessionInput } from './dto'
import type { ActiveUser } from './schema/activeUserSchema'
import type { User } from './schema/userSchema'

// 新しいSupabase Auth用のRepository
export interface UserQueryRepository {
  findById(id: bigint): AsyncResult<Nullable<User>, ClientError | ServerError>
  findBySupabaseId(supabaseId: string): AsyncResult<Nullable<User>, ClientError | ServerError>
}

export interface UserCommandRepository {
  create(data: { supabaseId: string }): AsyncResult<User, ClientError | ServerError>
}

// 古いActiveUser用のRepository（後で削除予定）
export interface Query {
  findActiveById(id: bigint): AsyncResult<Nullable<ActiveUser>, Error>
  findActiveByEmail(email: string): AsyncResult<Nullable<ActiveUser>, Error>
  findActiveBySessionId(sessionId: string): AsyncResult<Nullable<ActiveUser>, Error>
}

export interface Command {
  createActive(email: string, hashedPassword: string): AsyncResult<ActiveUser, Error>
  saveActive(activeUser: ActiveUser): AsyncResult<ActiveUser, Error>
  createSession(
    input: CreateSessionInput,
  ): AsyncResult<{ sessionId: string; expiresAt: Date }, Error>
  deleteSession(sessionId: string): AsyncResult<void, Error>
}
