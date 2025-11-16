import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { AlreadyExistsError, NotFoundError, ServerError } from '@/common/errors'
import type { RolePermissionCommand } from '../repository'
import type { RolePermission, RolePermissionInput } from '../schema/rolePermissionSchema'

export class RolePermissionCommandImpl implements RolePermissionCommand {
  constructor(private rdb: PrismaClient) {}

  async grantPermissionToRole(input: RolePermissionInput): AsyncResult<RolePermission, Error> {
    try {
      // ロールの存在確認
      const role = await this.rdb.role.findUnique({
        where: { roleId: input.roleId },
      })
      if (!role) {
        return failure(new NotFoundError('ロールが見つかりません'))
      }

      // パーミッションの存在確認
      const permission = await this.rdb.permission.findUnique({
        where: { permissionId: input.permissionId },
      })
      if (!permission) {
        return failure(new NotFoundError('パーミッションが見つかりません'))
      }

      // 既存チェック
      const existing = await this.rdb.rolePermission.findUnique({
        where: {
          // biome-ignore lint/style/useNamingConvention: Prisma generated composite key name
          roleId_permissionId: {
            roleId: input.roleId,
            permissionId: input.permissionId,
          },
        },
      })
      if (existing) {
        return failure(new AlreadyExistsError('既にこのパーミッションが付与されています'))
      }

      const rolePermission = await this.rdb.rolePermission.create({
        data: {
          roleId: input.roleId,
          permissionId: input.permissionId,
        },
      })

      return success({
        roleId: rolePermission.roleId,
        permissionId: rolePermission.permissionId,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`パーミッションの付与に失敗: ${message}`))
    }
  }

  async revokePermissionFromRole(input: RolePermissionInput): AsyncResult<void, Error> {
    try {
      const existing = await this.rdb.rolePermission.findUnique({
        where: {
          // biome-ignore lint/style/useNamingConvention: Prisma generated composite key name
          roleId_permissionId: {
            roleId: input.roleId,
            permissionId: input.permissionId,
          },
        },
      })

      if (!existing) {
        return failure(new NotFoundError('このパーミッションは付与されていません'))
      }

      await this.rdb.rolePermission.delete({
        where: {
          // biome-ignore lint/style/useNamingConvention: Prisma generated composite key name
          roleId_permissionId: {
            roleId: input.roleId,
            permissionId: input.permissionId,
          },
        },
      })

      return success(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`パーミッションの削除に失敗: ${message}`))
    }
  }

  async updateRolePermissions(roleId: number, permissionIds: number[]): AsyncResult<void, Error> {
    try {
      // ロールの存在確認
      const role = await this.rdb.role.findUnique({
        where: { roleId },
      })
      if (!role) {
        return failure(new NotFoundError('ロールが見つかりません'))
      }

      // トランザクションで一括更新
      await this.rdb.$transaction(async (tx) => {
        // 既存のパーミッションを全削除
        await tx.rolePermission.deleteMany({
          where: { roleId },
        })

        // 新しいパーミッションを追加
        if (permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: permissionIds.map((permissionId) => ({
              roleId,
              permissionId,
            })),
          })
        }
      })

      return success(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`ロールパーミッションの更新に失敗: ${message}`))
    }
  }
}
