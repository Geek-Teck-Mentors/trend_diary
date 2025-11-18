export type UserWithRolesRow = {
  activeUserId: bigint
  email: string
  displayName: string | null
  authenticationId: string | null
  createdAt: Date
  hasAdminAccess: boolean
  adminGrantedAt: Date | null
  adminGrantedByUserId: bigint | null
}

export function toUserListItem(row: UserWithRolesRow) {
  return {
    activeUserId: row.activeUserId,
    email: row.email,
    displayName: row.displayName,
    hasAdminAccess: row.hasAdminAccess,
    grantedAt: row.adminGrantedAt,
    grantedByAdminUserId: row.adminGrantedByUserId,
    createdAt: row.createdAt,
  }
}
