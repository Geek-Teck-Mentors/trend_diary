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
    // NOTE: bigint→number変換。Number.MAX_SAFE_INTEGER (9007兆) を超えると精度が失われる
    // 将来的に大規模システムになった場合は、string型での返却も検討すること
    grantedByAdminUserId: row.adminGrantedByUserId ? Number(row.adminGrantedByUserId) : null,
    createdAt: row.createdAt,
  }
}
