export type UserWithRolesRow = {
  activeUserId: bigint
  email: string
  displayName: string | null
  authenticationId: string | null
  createdAt: Date
  userRoles: {
    roleId: number
    grantedAt: Date
    grantedByActiveUserId: bigint | null
    role: {
      roleId: number
      displayName: string
      rolePermissions: {
        permission: {
          resource: string
          action: string
        }
      }[]
    }
  }[]
}

export function toUserListItem(row: UserWithRolesRow) {
  // 管理系権限を持つロールを探す
  // user.list, user.grant_admin, privacy_policy.create などの管理者特有の権限をチェック
  const adminRole = row.userRoles.find((ur) =>
    ur.role.rolePermissions.some(
      (rp) =>
        (rp.permission.resource === 'user' &&
          (rp.permission.action === 'list' || rp.permission.action === 'grant_admin')) ||
        (rp.permission.resource === 'privacy_policy' &&
          (rp.permission.action === 'create' ||
            rp.permission.action === 'update' ||
            rp.permission.action === 'delete')),
    ),
  )

  return {
    activeUserId: row.activeUserId,
    email: row.email,
    displayName: row.displayName,
    hasAdminAccess: adminRole !== undefined,
    grantedAt: adminRole?.grantedAt || null,
    grantedByAdminUserId: adminRole?.grantedByActiveUserId
      ? Number(adminRole.grantedByActiveUserId)
      : null,
    createdAt: row.createdAt,
  }
}
