import { AsyncResult, Nullable } from '@/common/types/utility'
import ActiveUser from '../model/activeUser'

export interface QueryService {
  findActiveById(id: bigint): AsyncResult<Nullable<ActiveUser>, Error>
  findActiveByEmail(email: string): AsyncResult<Nullable<ActiveUser>, Error>
  findActiveBySessionId(sessionId: string): AsyncResult<Nullable<ActiveUser>, Error>
}
