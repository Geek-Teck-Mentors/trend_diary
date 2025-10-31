import { AsyncResult } from '@yuukihayashi0510/core'
import { Nullable } from '@/common/types/utility'
import type { AdminUser } from './schema/adminUserSchema'
import { UserListResult } from './schema/userListSchema'
import { UserSearchQuery } from './schema/userSearchSchema'

export interface AdminQuery {
  findAdminByActiveUserId(activeUserId: bigint): AsyncResult<
    Nullable<{
      adminUserId: number
      activeUserId: bigint
      grantedAt: Date
      grantedByAdminUserId: number
    }>,
    Error
  >
  findAllUsers(query?: UserSearchQuery): AsyncResult<UserListResult, Error>
}

export interface AdminCommand {
  grantAdminRole(activeUserId: bigint, grantedByAdminUserId: number): AsyncResult<AdminUser, Error>
}
