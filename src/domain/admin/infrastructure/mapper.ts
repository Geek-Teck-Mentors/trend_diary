import type { AdminUser } from '../schema/adminUserSchema'

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
  authenticationId: string | null
  createdAt: Date
  adminUser: {
    adminUserId: number
    grantedAt: Date
    grantedByAdminUserId: number
  } | null
}

export function toDomainAdminUser(row: AdminUserRow): AdminUser {
  return {
    adminUserId: row.adminUserId,
    activeUserId: row.activeUserId,
    grantedAt: row.grantedAt,
    grantedByAdminUserId: row.grantedByAdminUserId,
  }
}

export function toUserListItem(row: UserWithAdminRow) {
  return {
    activeUserId: row.activeUserId,
    email: row.email,
    displayName: row.displayName,
    hasAdminAccess: row.adminUser !== null,
    grantedAt: row.adminUser?.grantedAt || null,
    grantedByAdminUserId: row.adminUser?.grantedByAdminUserId || null,
    createdAt: row.createdAt,
  }
}
