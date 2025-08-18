import AdminUser from '../model/adminUser'

export type AdminUserRow = {
  AdminUserId: number
  ActiveUserId: bigint
  grantedAt: Date
  grantedByAdminUserId: number
}

export type UserWithAdminRow = {
  activeUserId: bigint
  email: string
  displayName: string | null
  createdAt: Date
  adminUser: {
    AdminUserId: number
    grantedAt: Date
    grantedByAdminUserId: number
  } | null
}

export function toDomainAdminUser(row: AdminUserRow): AdminUser {
  return new AdminUser(row.AdminUserId, row.ActiveUserId, row.grantedAt, row.grantedByAdminUserId)
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
