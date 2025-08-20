import AdminUser from '../model/adminUser'

export type AdminUserRow = {
  adminUserId: number
  activeUserId: bigint
  grantedAt: Date
  grantedByAdminUserId: number
}

export type UserWithAdminRow = {
  activeUserId: bigint
  email: string
  displayName: string | null
  createdAt: Date
  adminUser: {
    adminUserId: number
    grantedAt: Date
    grantedByAdminUserId: number
  } | null
}

export function toDomainAdminUser(row: AdminUserRow): AdminUser {
  return new AdminUser(row.adminUserId, row.activeUserId, row.grantedAt, row.grantedByAdminUserId)
}

export function toUserListItem(row: UserWithAdminRow) {
  return {
    activeUserId: row.activeUserId,
    email: row.email,
    displayName: row.displayName,
    isAdmin: row.adminUser !== null,
    grantedAt: row.adminUser?.grantedAt || null,
    grantedByAdminUserId: row.adminUser?.grantedByAdminUserId || null,
    createdAt: row.createdAt,
  }
}
