import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { Nullable } from '@/common/types/utility'
import type { PermissionQuery } from '../repository'
import type { Permission } from '../schema/permissionSchema'

export class PermissionQueryImpl implements PermissionQuery {
  constructor(private rdb: PrismaClient) {}

  async getUserPermissions(activeUserId: bigint): AsyncResult<Permission[], Error> {
    try {
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
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`ユーザーのパーミッション取得に失敗: ${message}`))
    }
  }

  /**
   * パスパターン（例: /api/users/:id）を正規表現パターンに変換
   * :paramName を [^/]+ に置き換える
   */
  private pathPatternToRegex(pattern: string): RegExp {
    const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+')
    return new RegExp(`^${regexPattern}$`)
  }

  async getRequiredPermissionsByEndpoint(
    path: string,
    method: string,
  ): AsyncResult<Permission[], Error> {
    try {
      // まず完全一致を試す（パフォーマンス最適化）
      const exactMatch = await this.rdb.endpoint.findUnique({
        where: {
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

      if (exactMatch) {
        const permissions = exactMatch.endpointPermissions.map((ep) => ({
          permissionId: ep.permission.permissionId,
          resource: ep.permission.resource,
          action: ep.permission.action,
        }))
        return success(permissions)
      }

      // 完全一致しない場合、パターンマッチングを試す
      const endpoints = await this.rdb.endpoint.findMany({
        where: {
          method,
        },
        include: {
          endpointPermissions: {
            include: {
              permission: true,
            },
          },
        },
      })

      const matchedEndpoint = endpoints.find((endpoint) => {
        const regex = this.pathPatternToRegex(endpoint.path)
        return regex.test(path)
      })

      if (!matchedEndpoint) {
        return success([])
      }

      const permissions = matchedEndpoint.endpointPermissions.map((ep) => ({
        permissionId: ep.permission.permissionId,
        resource: ep.permission.resource,
        action: ep.permission.action,
      }))

      return success(permissions)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`エンドポイントの権限取得に失敗: ${message}`))
    }
  }

  async findAllPermissions(): AsyncResult<Permission[], Error> {
    try {
      const permissions = await this.rdb.permission.findMany({
        orderBy: [{ resource: 'asc' }, { action: 'asc' }],
      })

      return success(
        permissions.map((p) => ({
          permissionId: p.permissionId,
          resource: p.resource,
          action: p.action,
        })),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`パーミッション一覧の取得に失敗: ${message}`))
    }
  }

  async findPermissionById(permissionId: number): AsyncResult<Nullable<Permission>, Error> {
    try {
      const permission = await this.rdb.permission.findUnique({
        where: { permissionId },
      })

      if (!permission) {
        return success(null)
      }

      return success({
        permissionId: permission.permissionId,
        resource: permission.resource,
        action: permission.action,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`パーミッションの取得に失敗: ${message}`))
    }
  }

  async findPermissionByResourceAndAction(
    resource: string,
    action: string,
  ): AsyncResult<Nullable<Permission>, Error> {
    try {
      const permission = await this.rdb.permission.findUnique({
        where: {
          resource_action: {
            resource,
            action,
          },
        },
      })

      if (!permission) {
        return success(null)
      }

      return success({
        permissionId: permission.permissionId,
        resource: permission.resource,
        action: permission.action,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`パーミッションの検索に失敗: ${message}`))
    }
  }
}
