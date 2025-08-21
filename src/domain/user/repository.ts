import { AsyncResult, Nullable } from '@/common/types/utility'
import { CreateSessionInput } from './dto'
import type { ActiveUser } from './schema/activeUserSchema'

export interface QueryService {
  findActiveById(id: bigint): AsyncResult<Nullable<ActiveUser>, Error>
  findActiveByEmail(email: string): AsyncResult<Nullable<ActiveUser>, Error>
  findActiveBySessionId(sessionId: string): AsyncResult<Nullable<ActiveUser>, Error>
}

export interface CommandService {
  createActive(email: string, hashedPassword: string): AsyncResult<ActiveUser, Error>
  saveActive(activeUser: ActiveUser): AsyncResult<ActiveUser, Error>
  createSession(
    input: CreateSessionInput,
  ): AsyncResult<{ sessionId: string; expiresAt: Date }, Error>
  deleteSession(sessionId: string): AsyncResult<void, Error>
}
