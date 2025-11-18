import { ActiveUser as RdbActiveUser } from '@prisma/client'
import type { ActiveUserWithoutPassword } from '../schema/activeUserSchema'

export function mapToActiveUser(activeUser: RdbActiveUser): ActiveUserWithoutPassword {
  return {
    activeUserId: activeUser.activeUserId,
    userId: activeUser.userId,
    email: activeUser.email,
    displayName: activeUser.displayName,
    authenticationId: activeUser.authenticationId ?? undefined,
    lastLogin: activeUser.lastLogin ?? undefined,
    createdAt: activeUser.createdAt,
    updatedAt: activeUser.updatedAt,
  }
}
