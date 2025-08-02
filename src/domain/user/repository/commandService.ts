import { AsyncResult } from '@/common/types/utility'
import ActiveUser from '../model/activeUser'
import { SessionInput } from '../schema/sessionSchema'

export interface CommandService {
  createActive(email: string, hashedPassword: string): AsyncResult<ActiveUser, Error>
  saveActive(activeUser: ActiveUser): AsyncResult<ActiveUser, Error>
  createSession(input: SessionInput): AsyncResult<{ sessionId: string; expiresAt: Date }, Error>
  deleteSession(sessionId: string): AsyncResult<void, Error>
}
