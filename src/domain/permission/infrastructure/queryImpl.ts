import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { Nullable } from '@/common/types/utility'
import type { PermissionQuery } from '../repository'
import type { Permission } from '../schema/permissionSchema'
import type { Role } from '../schema/roleSchema'
import type { UserRole } from '../schema/userRoleSchema'

export class PermissionQueryImpl implements PermissionQuery {
  constructor(private rdb: PrismaClient) {}

  async getUserRoles(activeUserId: bigint): AsyncResult<Role[], Error> {
    try {
      const userRoles = await this.rdb.userRole.findMany({
        where: {
          activeUserId,
        },
        include: {
          role: true,
        },
      })

      const roles = userRoles.map((ur) => ({
        roleId: ur.role.roleId,
        displayName: ur.role.displayName,
        description: ur.role.description,
        createdAt: ur.role.createdAt,
      }))

      return success(roles)
    } catch (error) {
      return failure(new ServerError(`ユーザーのロール取得に失敗: ${error}`))
    }
  }

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

  async getRoleByName(displayName: string): AsyncResult<Nullable<Role>, Error> {
    try {
      const role = await this.rdb.role.findFirst({
        where: { displayName },
      })

      if (!role) {
        return success(null)
      }

      return success({
        roleId: role.roleId,
        displayName: role.displayName,
        description: role.description,
        createdAt: role.createdAt,
      })
    } catch (error) {
      return failure(new ServerError(`ロール取得に失敗: ${error}`))
    }
  }

  async getPermissionByResourceAction(
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
      return failure(new ServerError(`パーミッション取得に失敗: ${error}`))
    }
  }

  async getUserRoleByUserAndRole(
    activeUserId: bigint,
    roleId: number,
  ): AsyncResult<Nullable<UserRole>, Error> {
    try {
      const userRole = await this.rdb.userRole.findUnique({
        where: {
          // biome-ignore lint/style/useNamingConvention: Prisma auto-generated composite key name
          activeUserId_roleId: {
            activeUserId,
            roleId,
          },
        },
      })

      if (!userRole) {
        return success(null)
      }

      return success({
        activeUserId: userRole.activeUserId,
        roleId: userRole.roleId,
        grantedAt: userRole.grantedAt,
      })
    } catch (error) {
      return failure(new ServerError(`ユーザーロール取得に失敗: ${error}`))
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
