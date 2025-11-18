import { AsyncResult } from '@yuukihayashi0510/core'
import type { AdminUser } from './schema/adminUserSchema'
import { UserListResult } from './schema/userListSchema'
import { UserSearchQuery } from './schema/userSearchSchema'

export interface AdminQuery {
  findAllUsers(query?: UserSearchQuery): AsyncResult<UserListResult, Error>
  hasAdminPermissions(activeUserId: bigint): Promise<boolean>
}

export interface AdminCommand {
  grantAdminRole(activeUserId: bigint, grantedByActiveUserId: bigint): AsyncResult<AdminUser, Error>
}
