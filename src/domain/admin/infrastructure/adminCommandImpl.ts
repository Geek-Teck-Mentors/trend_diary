import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { AlreadyExistsError, NotFoundError, ServerError } from '@/common/errors'
import { AdminCommand } from '../repository'
import type { AdminUser } from '../schema/adminUserSchema'

export class AdminCommandImpl implements AdminCommand {
  constructor(private rdb: PrismaClient) {}

  async grantAdminRole(
    activeUserId: bigint,
    grantedByActiveUserId: bigint,
  ): AsyncResult<AdminUser, Error> {
    // ユーザーが存在するかチェック
    const existingUserResult = await wrapAsyncCall(() =>
      this.rdb.activeUser.findUnique({
        where: { activeUserId },
      }),
    )
    if (isFailure(existingUserResult)) {
      return failure(new ServerError(`Admin権限の付与に失敗しました: ${existingUserResult.error}`))
    }

    const existingUser = existingUserResult.data
    if (!existingUser) {
      return failure(new NotFoundError('ユーザーが見つかりません'))
    }

    // 管理者ロールを取得
    const adminRoleResult = await wrapAsyncCall(() =>
      this.rdb.role.findFirst({
        where: { displayName: '管理者' },
      }),
    )
    if (isFailure(adminRoleResult)) {
      return failure(new ServerError(`Admin権限の付与に失敗しました: ${adminRoleResult.error}`))
    }

    const adminRole = adminRoleResult.data
    if (!adminRole) {
      return failure(new ServerError('管理者ロールが見つかりません'))
    }

    // 既にAdmin権限を持っているかチェック
    const existingRoleResult = await wrapAsyncCall(() =>
      this.rdb.userRole.findUnique({
        where: {
          // biome-ignore lint/style/useNamingConvention: Prisma composite unique key name
          activeUserId_roleId: {
            activeUserId: activeUserId,
            roleId: adminRole.roleId,
          },
        },
      }),
    )
    if (isFailure(existingRoleResult)) {
      return failure(new ServerError(`Admin権限の付与に失敗しました: ${existingRoleResult.error}`))
    }

    const existingRole = existingRoleResult.data
    if (existingRole) {
      return failure(new AlreadyExistsError('既にAdmin権限を持っています'))
    }

    // Admin権限付与（UserRoleに追加）
    const userRoleResult = await wrapAsyncCall(() =>
      this.rdb.userRole.create({
        data: {
          activeUserId: activeUserId,
          roleId: adminRole.roleId,
          grantedByActiveUserId,
        },
        include: {
          role: true,
        },
      }),
    )
    if (isFailure(userRoleResult)) {
      return failure(new ServerError(`Admin権限の付与に失敗しました: ${userRoleResult.error}`))
    }

    // AdminUser形式に変換して返す（後方互換性のため）
    // grantedByActiveUserIdは必ず値があるはず（この関数で設定している）
    if (!userRoleResult.data.grantedByActiveUserId) {
      return failure(new ServerError('grantedByActiveUserIdが設定されていません'))
    }

    return success({
      adminUserId: userRoleResult.data.roleId,
      activeUserId: userRoleResult.data.activeUserId,
      grantedAt: userRoleResult.data.grantedAt,
      grantedByAdminUserId: Number(userRoleResult.data.grantedByActiveUserId),
    })
  }
}
