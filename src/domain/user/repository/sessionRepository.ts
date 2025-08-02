import { AsyncResult, Nullable } from '@/common/types/utility'
import Session from '../model/session'
import { SessionInput, SessionUpdate } from '../schema/sessionSchema'

export interface SessionRepository {
  create(input: SessionInput): AsyncResult<Session, Error>
  findById(sessionId: string): AsyncResult<Nullable<Session>, Error>
  findByActiveUserId(activeUserId: bigint): AsyncResult<Nullable<Session>, Error>
  update(sessionId: string, updates: SessionUpdate): AsyncResult<Session, Error>
  delete(sessionId: string): AsyncResult<void, Error>
  deleteExpired(): AsyncResult<number, Error> // 削除した件数を返す
}
