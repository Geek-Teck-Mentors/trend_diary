import { AsyncResult, Nullable } from '@/common/types/utility'
import ActiveUser from '../model/activeUser'

export interface ActiveUserRepository {
  createActiveUser(userId: bigint, email: string, hashedPassword: string, displayName?: string): AsyncResult<ActiveUser, Error>
  findById(activeUserId: bigint): AsyncResult<Nullable<ActiveUser>, Error>
  findByUserId(userId: bigint): AsyncResult<Nullable<ActiveUser>, Error>
  findByEmail(email: string): AsyncResult<Nullable<ActiveUser>, Error>
  findBySessionId(sessionId: string): AsyncResult<Nullable<ActiveUser>, Error>
  save(activeUser: ActiveUser): AsyncResult<ActiveUser, Error>
  delete(activeUser: ActiveUser): AsyncResult<ActiveUser, Error>
  addSession(activeUserId: bigint, expiresAt: Date): AsyncResult<string, Error>
  removeSession(sessionId: string): AsyncResult<void, Error>
}