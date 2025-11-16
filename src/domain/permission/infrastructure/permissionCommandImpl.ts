import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { AlreadyExistsError, NotFoundError, ServerError } from '@/common/errors'
import type { PermissionCommand } from '../repository'
import type { Permission, PermissionInput } from '../schema/permissionSchema'

export class PermissionCommandImpl implements PermissionCommand {
  constructor(private rdb: PrismaClient) {}

  async createPermission(input: PermissionInput): AsyncResult<Permission, Error> {
    try {
      // 既存チェック
      const existing = await this.rdb.permission.findUnique({
        where: {
          resource_action: {
            resource: input.resource,
            action: input.action,
          },
        },
      })

      if (existing) {
        return failure(new AlreadyExistsError('同じリソースとアクションの権限が既に存在します'))
      }

      const permission = await this.rdb.permission.create({
        data: {
          resource: input.resource,
          action: input.action,
        },
      })

      return success({
        permissionId: permission.permissionId,
        resource: permission.resource,
        action: permission.action,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`パーミッションの作成に失敗: ${message}`))
    }
  }

  async deletePermission(permissionId: number): AsyncResult<void, Error> {
    try {
      const existing = await this.rdb.permission.findUnique({
        where: { permissionId },
      })

      if (!existing) {
        return failure(new NotFoundError('パーミッションが見つかりません'))
      }

      await this.rdb.permission.delete({
        where: { permissionId },
      })

      return success(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`パーミッションの削除に失敗: ${message}`))
    }
  }
}
