import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { Nullable } from '@/common/types/utility'
import type { PermissionQuery } from '../repository'
import type { Permission } from '../schema/permissionSchema'
import type { Role } from '../schema/roleSchema'
import type { UserRole } from '../schema/userRoleSchema'

export class PermissionQueryImpl implements PermissionQuery {
  constructor(private rdb: PrismaClient) {}

  async getUserRoles(activeUserId: bigint): AsyncResult<Role[], Error> {
    // TODO: DB実装
    // ユーザーが持つ有効なロール（期限内かつ未剥奪）を取得
    // SELECT r.* FROM roles r
    // JOIN user_roles ur ON r.role_id = ur.role_id
    // WHERE ur.active_user_id = ? AND ur.revoked_at IS NULL
    //   AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    return failure(new ServerError('getUserRoles: 未実装'))
  }

  async getUserPermissions(activeUserId: bigint): AsyncResult<Permission[], Error> {
    // TODO: DB実装
    // ユーザーのロール経由でパーミッションを取得
    // SELECT DISTINCT p.* FROM permissions p
    // JOIN role_permissions rp ON p.permission_id = rp.permission_id
    // JOIN user_roles ur ON rp.role_id = ur.role_id
    // WHERE ur.active_user_id = ? AND ur.revoked_at IS NULL
    //   AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    return failure(new ServerError('getUserPermissions: 未実装'))
  }

  async getRoleByName(roleName: string): AsyncResult<Nullable<Role>, Error> {
    // TODO: DB実装
    // SELECT * FROM roles WHERE name = ?
    return failure(new ServerError('getRoleByName: 未実装'))
  }

  async getPermissionByResourceAction(
    resource: string,
    action: string,
  ): AsyncResult<Nullable<Permission>, Error> {
    // TODO: DB実装
    // SELECT * FROM permissions WHERE resource = ? AND action = ?
    return failure(new ServerError('getPermissionByResourceAction: 未実装'))
  }

  async getUserRoleByUserAndRole(
    activeUserId: bigint,
    roleId: number,
  ): AsyncResult<Nullable<UserRole>, Error> {
    // TODO: DB実装
    // SELECT * FROM user_roles WHERE active_user_id = ? AND role_id = ?
    return failure(new ServerError('getUserRoleByUserAndRole: 未実装'))
  }
}
