import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { NotFoundError, ServerError } from '@/common/errors'
import type { PermissionCommand } from '../repository'
import type { UserRole, UserRoleInput, UserRoleRevoke } from '../schema/userRoleSchema'

export class PermissionCommandImpl implements PermissionCommand {
  constructor(private rdb: PrismaClient) {}

  async assignRole(input: UserRoleInput): AsyncResult<UserRole, Error> {
    try {
      // ユーザーが存在するかチェック
      const existingUser = await this.rdb.activeUser.findUnique({
        where: { activeUserId: input.activeUserId },
      })

      if (!existingUser) {
        return failure(new NotFoundError('ユーザーが見つからない'))
      }

      // ロールが存在するかチェック
      const existingRole = await this.rdb.role.findUnique({
        where: { roleId: input.roleId },
      })

      if (!existingRole) {
        return failure(new NotFoundError('ロールが見つからない'))
      }

      // ロール付与
      const userRole = await this.rdb.userRole.create({
        data: {
          activeUserId: input.activeUserId,
          roleId: input.roleId,
          grantedAt: new Date(),
        },
      })

      return success({
        activeUserId: userRole.activeUserId,
        roleId: userRole.roleId,
        grantedAt: userRole.grantedAt,
      })
    } catch (error) {
      return failure(new ServerError(`ロール付与に失敗: ${error}`))
    }
  }

  async revokeRole(input: UserRoleRevoke): AsyncResult<UserRole, Error> {
    try {
      // ユーザーロールが存在するかチェック
      const existingUserRole = await this.rdb.userRole.findUnique({
        where: {
          // biome-ignore lint/style/useNamingConvention: Prisma generated composite key name
          activeUserId_roleId: {
            activeUserId: input.activeUserId,
            roleId: input.roleId,
          },
        },
      })

      if (!existingUserRole) {
        return failure(new NotFoundError('ユーザーロールが見つからない'))
      }

      // 物理削除
      await this.rdb.userRole.delete({
        where: {
          // biome-ignore lint/style/useNamingConvention: Prisma generated composite key name
          activeUserId_roleId: {
            activeUserId: input.activeUserId,
            roleId: input.roleId,
          },
        },
      })

      // 削除前の情報を返す
      return success({
        activeUserId: existingUserRole.activeUserId,
        roleId: existingUserRole.roleId,
        grantedAt: existingUserRole.grantedAt,
      })
    } catch (error) {
      return failure(new ServerError(`ロール剥奪に失敗: ${error}`))
    }
  }
}
