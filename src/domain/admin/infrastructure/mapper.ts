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
    }
  }[]
}

export function toUserListItem(row: UserWithRolesRow) {
  // 管理者ロールまたはスーパー管理者ロールを探す
  const adminRole = row.userRoles.find(
    (ur) => ur.role.displayName === '管理者' || ur.role.displayName === 'スーパー管理者',
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
