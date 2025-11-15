import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import type { PermissionQuery } from '../repository'
import type { Permission } from '../schema/permissionSchema'

export class PermissionQueryImpl implements PermissionQuery {
  constructor(private rdb: PrismaClient) {}

  async getUserPermissions(activeUserId: bigint): AsyncResult<Permission[], Error> {
    try {
      // ユーザーのロールを取得
      const userRoles = await this.rdb.userRole.findMany({
        where: {
          activeUserId,
        },
        select: {
          roleId: true,
        },
      })

      if (userRoles.length === 0) {
        return success([])
      }

      const roleIds = userRoles.map((ur) => ur.roleId)

      // ロールに紐づくパーミッションを取得（重複排除）
      const rolePermissions = await this.rdb.rolePermission.findMany({
        where: {
          roleId: {
            in: roleIds,
          },
        },
        include: {
          permission: true,
        },
        distinct: ['permissionId'],
      })

      const permissions = rolePermissions.map((rp) => ({
        permissionId: rp.permission.permissionId,
        resource: rp.permission.resource,
        action: rp.permission.action,
      }))

      return success(permissions)
    } catch (error) {
      return failure(new ServerError(`ユーザーのパーミッション取得に失敗: ${error}`))
    }
  }

  async getRequiredPermissionsByEndpoint(
    path: string,
    method: string,
  ): AsyncResult<Permission[], Error> {
    try {
      // エンドポイントを検索（パスマッチングは後で実装、まずは完全一致）
      const endpoint = await this.rdb.endpoint.findUnique({
        where: {
          // biome-ignore lint/style/useNamingConvention: Prisma auto-generated composite key name
          path_method: {
            path,
            method,
          },
        },
        include: {
          endpointPermissions: {
            include: {
              permission: true,
            },
          },
        },
      })

      if (!endpoint) {
        return success([])
      }

      const permissions = endpoint.endpointPermissions.map((ep) => ({
        permissionId: ep.permission.permissionId,
        resource: ep.permission.resource,
        action: ep.permission.action,
      }))

      return success(permissions)
    } catch (error) {
      return failure(new ServerError(`エンドポイントの権限取得に失敗: ${error}`))
    }
  }
}
