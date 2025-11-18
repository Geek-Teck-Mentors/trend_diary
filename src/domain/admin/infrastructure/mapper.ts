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
  // 管理系権限（user, privacy_policyリソース）を持つロールを探す
  const adminRole = row.userRoles.find((ur) =>
    ur.role.rolePermissions.some(
      (rp) => rp.permission.resource === 'user' || rp.permission.resource === 'privacy_policy',
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
