import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { Nullable } from '@/common/types/utility'
import type { RoleQuery } from '../repository'
import type { Permission } from '../schema/permissionSchema'
import type { Role } from '../schema/roleSchema'

export class RoleQueryImpl implements RoleQuery {
  constructor(private rdb: PrismaClient) {}

  async findAllRoles(): AsyncResult<Role[], Error> {
    try {
      const roles = await this.rdb.role.findMany({
        orderBy: { roleId: 'asc' },
      })

      return success(
        roles.map((r) => ({
          roleId: r.roleId,
          displayName: r.displayName,
          description: r.description,
          createdAt: r.createdAt,
        })),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`ロール一覧の取得に失敗: ${message}`))
    }
  }

  async findRoleById(roleId: number): AsyncResult<Nullable<Role>, Error> {
    try {
      const role = await this.rdb.role.findUnique({
        where: { roleId },
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
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`ロールの取得に失敗: ${message}`))
    }
  }

  async findPermissionsByRoleId(roleId: number): AsyncResult<Permission[], Error> {
    try {
      const rolePermissions = await this.rdb.rolePermission.findMany({
        where: { roleId },
        include: {
          permission: true,
        },
        orderBy: [{ permission: { resource: 'asc' } }, { permission: { action: 'asc' } }],
      })

      return success(
        rolePermissions.map((rp) => ({
          permissionId: rp.permission.permissionId,
          resource: rp.permission.resource,
          action: rp.permission.action,
        })),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`ロールのパーミッション取得に失敗: ${message}`))
    }
  }
}
