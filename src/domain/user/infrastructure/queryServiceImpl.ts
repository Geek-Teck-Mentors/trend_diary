import { Prisma, ActiveUser as RdbActiveUser } from '@prisma/client'
import { getErrorMessage, ServerError } from '@/common/errors'
import { AsyncResult, Nullable, resultError, resultSuccess } from '@/common/types/utility'
import { RdbClient } from '@/infrastructure/rdb'
import ActiveUser from '../model/activeUser'
import { QueryService } from '../repository/queryService'
import { mapToActiveUser } from './mapper'

export default class QueryServiceImpl implements QueryService {
  constructor(private readonly db: RdbClient) {}

  async findActiveById(id: bigint): AsyncResult<Nullable<ActiveUser>, Error> {
    try {
      const activeUser = await this.db.activeUser.findUnique({
        where: { activeUserId: id },
      })

      if (!activeUser) {
        return resultSuccess(null)
      }

      return resultSuccess(mapToActiveUser(activeUser))
    } catch (error) {
      return resultError(new ServerError(getErrorMessage(error)))
    }
  }

  async findActiveByEmail(email: string): AsyncResult<Nullable<ActiveUser>, Error> {
    try {
      const activeUser = await this.db.activeUser.findUnique({
        where: { email },
      })

      if (!activeUser) {
        return resultSuccess(null)
      }

      return resultSuccess(mapToActiveUser(activeUser))
    } catch (error) {
      return resultError(new ServerError(getErrorMessage(error)))
    }
  }

  async findActiveBySessionId(sessionId: string): AsyncResult<Nullable<ActiveUser>, Error> {
    try {
      const query = Prisma.sql`
        SELECT
          au.active_user_id AS "activeUserId",
          au.user_id AS "userId",
          au.email AS "email",
          au.password AS "password",
          au.display_name AS "displayName",
          au.last_login AS "lastLogin"
        FROM active_users au
        INNER JOIN sessions s ON au.active_user_id = s.active_user_id
        WHERE s.session_id = ${sessionId}
          AND s.expires_at > NOW()
      `

      const result = await this.db.$queryRaw<RdbActiveUser[]>(query)

      if (result.length === 0) {
        return resultSuccess(null)
      }

      return resultSuccess(mapToActiveUser(result[0]))
    } catch (error) {
      return resultError(new ServerError(getErrorMessage(error)))
    }
  }
}
