import { AsyncResult } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { Nullable } from '@/common/types/utility'
import { CreateSessionInput } from './dto'
import type { ActiveUser, ActiveUserWithoutPassword, CurrentUser } from './schema/activeUserSchema'

export interface Query {
  findActiveById(id: bigint): AsyncResult<Nullable<ActiveUserWithoutPassword>, Error>
  findActiveByEmail(email: string): AsyncResult<Nullable<ActiveUserWithoutPassword>, Error>
  findActiveByEmailForAuth(email: string): AsyncResult<Nullable<ActiveUser>, Error>
  findActiveBySessionId(sessionId: string): AsyncResult<Nullable<CurrentUser>, Error>
  findActiveByAuthenticationId(
    authenticationId: string,
  ): AsyncResult<Nullable<ActiveUserWithoutPassword>, Error>
}

export interface Command {
  createActive(
    email: string,
    hashedPassword: string,
  ): AsyncResult<ActiveUserWithoutPassword, ServerError>
  createActiveWithAuthenticationId(
    email: string,
    hashedPassword: string,
    authenticationId: string,
    displayName?: string | null,
  ): AsyncResult<ActiveUserWithoutPassword, ServerError>
  saveActive(activeUser: ActiveUser): AsyncResult<ActiveUserWithoutPassword, ServerError>
  createSession(
    input: CreateSessionInput,
  ): AsyncResult<{ sessionId: string; expiresAt: Date }, ServerError>
  deleteSession(sessionId: string): AsyncResult<void, ServerError>
}
