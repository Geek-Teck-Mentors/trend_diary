import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import type { PermissionCommand } from '../repository'
import type { UserRole, UserRoleInput, UserRoleRevoke } from '../schema/userRoleSchema'

export class PermissionCommandImpl implements PermissionCommand {
  constructor(private rdb: PrismaClient) {}

  async assignRole(input: UserRoleInput): AsyncResult<UserRole, Error> {
    // TODO: DB実装
    // INSERT INTO user_roles (active_user_id, role_id, granted_by, expires_at, note)
    // VALUES (?, ?, ?, ?, ?)
    return failure(new ServerError('assignRole: 未実装'))
  }

  async revokeRole(input: UserRoleRevoke): AsyncResult<UserRole, Error> {
    // TODO: DB実装
    // UPDATE user_roles SET revoked_at = NOW(), revoked_by = ?
    // WHERE active_user_id = ? AND role_id = ? AND revoked_at IS NULL
    return failure(new ServerError('revokeRole: 未実装'))
  }
}
