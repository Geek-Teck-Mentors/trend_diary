import type { AdminUser } from '../schema/adminUserSchema'

export type AdminUserRow = {
  adminUserId: number
  userId: bigint
  grantedAt: Date
  grantedByAdminUserId: number
}

export type UserWithAdminRow = {
  userId: bigint
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
  return {
    adminUserId: row.adminUserId,
    userId: row.userId,
    grantedAt: row.grantedAt,
    grantedByAdminUserId: row.grantedByAdminUserId,
  }
}

export function toUserListItem(row: UserWithAdminRow) {
  return {
    userId: row.userId,
    email: row.email,
    displayName: row.displayName,
    isAdmin: row.adminUser !== null,
    grantedAt: row.adminUser?.grantedAt || null,
    grantedByAdminUserId: row.adminUser?.grantedByAdminUserId || null,
    createdAt: row.createdAt,
  }
}
