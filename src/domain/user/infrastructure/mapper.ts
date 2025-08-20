import { ActiveUser as RdbActiveUser, AdminUser as RdbAdminUser } from '@prisma/client'
import { Nullable } from '@/common/types/utility'
import ActiveUser from '../model/activeUser'

export function mapToActiveUser(
  activeUser: RdbActiveUser & { adminUser?: Nullable<RdbAdminUser> },
): ActiveUser {
  return new ActiveUser(
    activeUser.activeUserId,
    activeUser.userId,
    activeUser.email,
    activeUser.password,
    activeUser.displayName,
    activeUser.lastLogin ?? undefined,
    activeUser.createdAt,
    activeUser.updatedAt,
    activeUser.adminUser?.adminUserId ?? null,
  )
}
