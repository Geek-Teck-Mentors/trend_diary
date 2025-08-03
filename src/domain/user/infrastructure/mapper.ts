import { ActiveUser as RdbActiveUser } from '@prisma/client'
import ActiveUser from '../model/activeUser'

export function mapToActiveUser(activeUser: RdbActiveUser): ActiveUser {
  return new ActiveUser(
    activeUser.activeUserId,
    activeUser.userId,
    activeUser.email,
    activeUser.password,
    activeUser.displayName,
    activeUser.lastLogin ?? undefined,
    activeUser.createdAt,
    activeUser.updatedAt,
  )
}
