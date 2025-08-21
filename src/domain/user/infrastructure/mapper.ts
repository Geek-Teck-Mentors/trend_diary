import { ActiveUser as RdbActiveUser, AdminUser as RdbAdminUser } from '@prisma/client'
import { Nullable } from '@/common/types/utility'
import type { ActiveUser } from '../schema/activeUserSchema'

export function mapToActiveUser(
  activeUser: RdbActiveUser & { adminUser?: Nullable<RdbAdminUser> },
): ActiveUser {
  return {
    activeUserId: activeUser.activeUserId,
    userId: activeUser.userId,
    email: activeUser.email,
    password: activeUser.password,
    displayName: activeUser.displayName,
    lastLogin: activeUser.lastLogin ?? undefined,
    createdAt: activeUser.createdAt,
    updatedAt: activeUser.updatedAt,
    adminUserId: activeUser.adminUser?.adminUserId ?? null,
  }
}
