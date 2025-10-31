import { AsyncResult } from '@yuukihayashi0510/core'
import { Nullable } from '@/common/types/utility'
import { CreateSessionInput } from './dto'
import type { ActiveUser } from './schema/activeUserSchema'

export interface Query {
  findActiveById(id: bigint): AsyncResult<Nullable<ActiveUser>, Error>
  findActiveByEmail(email: string): AsyncResult<Nullable<ActiveUser>, Error>
  findActiveBySessionId(sessionId: string): AsyncResult<Nullable<ActiveUser>, Error>
  findActiveByAuthenticationId(authenticationId: string): AsyncResult<Nullable<ActiveUser>, Error>
}

export interface Command {
  createActive(email: string, hashedPassword: string): AsyncResult<ActiveUser, Error>
  createActiveWithAuthenticationId(
    email: string,
    hashedPassword: string,
    authenticationId: string,
    displayName?: string | null,
  ): AsyncResult<ActiveUser, Error>
  saveActive(activeUser: ActiveUser): AsyncResult<ActiveUser, Error>
  createSession(
    input: CreateSessionInput,
  ): AsyncResult<{ sessionId: string; expiresAt: Date }, Error>
  deleteSession(sessionId: string): AsyncResult<void, Error>
}
