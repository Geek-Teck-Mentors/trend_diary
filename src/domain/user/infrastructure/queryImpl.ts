import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { Nullable } from '@/common/types/utility'
import { RdbClient } from '@/infrastructure/rdb'
import { Query } from '../repository'
import type { ActiveUser, CurrentUser } from '../schema/activeUserSchema'
import { mapToActiveUser } from './mapper'

export default class QueryImpl implements Query {
  constructor(private readonly db: RdbClient) {}

  async findActiveById(id: bigint): AsyncResult<Nullable<ActiveUser>, Error> {
    const activeUserResult = await wrapAsyncCall(() =>
      this.db.activeUser.findUnique({
        where: { activeUserId: id },
      }),
    )
    if (isFailure(activeUserResult)) {
      return failure(new ServerError(activeUserResult.error))
    }

    const activeUser = activeUserResult.data
    if (!activeUser) {
      return success(null)
    }

    return success(mapToActiveUser(activeUser))
  }

  async findActiveByEmail(email: string): AsyncResult<Nullable<ActiveUser>, Error> {
    const activeUserResult = await wrapAsyncCall(() =>
      this.db.activeUser.findUnique({
        where: { email },
      }),
    )
    if (isFailure(activeUserResult)) {
      return failure(new ServerError(activeUserResult.error))
    }

    const activeUser = activeUserResult.data
    if (!activeUser) {
      return success(null)
    }

    return success(mapToActiveUser(activeUser))
  }

  async findActiveBySessionId(sessionId: string): AsyncResult<Nullable<CurrentUser>, Error> {
    const sessionResult = await wrapAsyncCall(() =>
      this.db.session.findFirst({
        where: {
          sessionId,
          expiresAt: { gt: new Date() },
        },
        include: { activeUser: true },
      }),
    )
    if (isFailure(sessionResult)) {
      return failure(new ServerError(sessionResult.error))
    }

    const session = sessionResult.data
    if (!session) {
      return success(null)
    }

    // 管理者権限チェック（権限ベース）
    // ユーザーが管理者特有の権限を持っているかチェック
    const adminPermissionCount = await this.db.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT p.permission_id) as count
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.permission_id
      WHERE ur.active_user_id = ${session.activeUser.activeUserId}
        AND (
          (p.resource = 'user' AND p.action IN ('list', 'grant_admin'))
          OR (p.resource = 'privacy_policy' AND p.action IN ('create', 'update', 'delete'))
        )
    `
    const hasAdminAccess = Number(adminPermissionCount[0]?.count || 0n) > 0

    // CurrentUserを返す（passwordは除く）
    const { password: _password, ...activeUserWithoutPassword } = mapToActiveUser(
      session.activeUser,
    )
    return success({
      ...activeUserWithoutPassword,
      hasAdminAccess,
    })
  }

  async findActiveByAuthenticationId(
    authenticationId: string,
  ): AsyncResult<Nullable<ActiveUser>, Error> {
    const activeUserResult = await wrapAsyncCall(() =>
      this.db.activeUser.findUnique({
        where: { authenticationId },
      }),
    )
    if (isFailure(activeUserResult)) {
      return failure(new ServerError(activeUserResult.error))
    }

    const activeUser = activeUserResult.data
    if (!activeUser) {
      return success(null)
    }

    return success(mapToActiveUser(activeUser))
  }
}
