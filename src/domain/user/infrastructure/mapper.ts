import { ActiveUser as RdbActiveUser } from '@prisma/client'
import type { ActiveUser } from '../schema/activeUserSchema'

export function mapToActiveUser(activeUser: RdbActiveUser): ActiveUser {
  return {
    activeUserId: activeUser.activeUserId,
    userId: activeUser.userId,
    email: activeUser.email,
    password: activeUser.password,
    displayName: activeUser.displayName,
    authenticationId: activeUser.authenticationId ?? undefined,
    lastLogin: activeUser.lastLogin ?? undefined,
    createdAt: activeUser.createdAt,
    updatedAt: activeUser.updatedAt,
  }
}
