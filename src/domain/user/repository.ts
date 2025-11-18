import { AsyncResult } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { Nullable } from '@/common/types/utility'
import { CreateSessionInput } from './dto'
import type { ActiveUser, CurrentUser } from './schema/activeUserSchema'

export interface Query {
  findActiveById(id: bigint): AsyncResult<Nullable<CurrentUser>, Error>
  findActiveByEmail(email: string): AsyncResult<Nullable<CurrentUser>, Error>
  findActiveByEmailForAuth(email: string): AsyncResult<Nullable<ActiveUser>, Error>
  findActiveBySessionId(
    sessionId: string,
  ): AsyncResult<Nullable<CurrentUser & { hasAdminAccess: boolean }>, Error>
  findActiveByAuthenticationId(authenticationId: string): AsyncResult<Nullable<CurrentUser>, Error>
}

export interface Command {
  createActive(email: string, hashedPassword: string): AsyncResult<CurrentUser, ServerError>
  createActiveWithAuthenticationId(
    email: string,
    hashedPassword: string,
    authenticationId: string,
    displayName?: string | null,
  ): AsyncResult<CurrentUser, ServerError>
  saveActive(activeUser: ActiveUser): AsyncResult<CurrentUser, ServerError>
  createSession(
    input: CreateSessionInput,
  ): AsyncResult<{ sessionId: string; expiresAt: Date }, ServerError>
  deleteSession(sessionId: string): AsyncResult<void, ServerError>
}
