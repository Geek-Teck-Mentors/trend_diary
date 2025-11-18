import { RdbClient } from '@/infrastructure/rdb'

/**
 * ロールに管理者権限があるかどうかを判定する共通ロジック
 */
function hasAdminPermission(permission: { resource: string; action: string }): boolean {
  return (
    (permission.resource === 'user' &&
      (permission.action === 'list' || permission.action === 'grant_admin')) ||
    (permission.resource === 'privacy_policy' &&
      (permission.action === 'create' ||
        permission.action === 'update' ||
        permission.action === 'delete'))
  )
}

/**
 * ユーザーが管理者権限を持っているかどうかを判定する（SQL版）
 * 管理者権限の定義:
 * - user.list または user.grant_admin
 * - privacy_policy.create, update, または delete
 */
export async function hasAdminPermissions(db: RdbClient, activeUserId: bigint): Promise<boolean> {
  const adminPermissionCount = await db.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(DISTINCT p.permission_id) as count
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE ur.active_user_id = ${activeUserId}
      AND (
        (p.resource = 'user' AND p.action IN ('list', 'grant_admin'))
        OR (p.resource = 'privacy_policy' AND p.action IN ('create', 'update', 'delete'))
      )
  `
  return Number(adminPermissionCount[0]?.count || 0n) > 0
}

type UserRoleWithPermissions = {
  role: {
    rolePermissions: Array<{
      permission: {
        resource: string
        action: string
      }
    }>
  }
}

/**
 * userRolesから管理者権限を持つロールを見つける
 */
export function findAdminRole<T extends UserRoleWithPermissions>(userRoles: T[]): T | undefined {
  return userRoles.find((ur) =>
    ur.role.rolePermissions.some((rp) => hasAdminPermission(rp.permission)),
  )
}
