import { AsyncResult } from '@/common/types/utility'
import { CreateSessionInput } from '../dto'
import type { ActiveUser } from '../schema/activeUserSchema'

export interface CommandService {
  createActive(email: string, hashedPassword: string): AsyncResult<ActiveUser, Error>
  saveActive(activeUser: ActiveUser): AsyncResult<ActiveUser, Error>
  createSession(
    input: CreateSessionInput,
  ): AsyncResult<{ sessionId: string; expiresAt: Date }, Error>
  deleteSession(sessionId: string): AsyncResult<void, Error>
}
