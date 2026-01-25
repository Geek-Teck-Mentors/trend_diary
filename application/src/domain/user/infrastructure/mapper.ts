import { ActiveUser as RdbActiveUser } from '@prisma/client'
import type { CurrentUser } from '../schema/active-user-schema'

export function mapToActiveUser(activeUser: RdbActiveUser): CurrentUser {
  return {
    activeUserId: activeUser.activeUserId,
    userId: activeUser.userId,
    email: activeUser.email,
    displayName: activeUser.displayName,
    authenticationId: activeUser.authenticationId ?? undefined,
    createdAt: activeUser.createdAt,
    updatedAt: activeUser.updatedAt,
  }
}
