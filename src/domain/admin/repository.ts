import { AsyncResult, Nullable } from '@/common/types/utility'
import type { AdminUser } from './schema/adminUserSchema'
import { UserListResult } from './schema/userListSchema'
import { UserSearchQuery } from './schema/userSearchSchema'

export interface AdminQuery {
  findAdminByActiveUserId(userId: bigint): AsyncResult<
    Nullable<{
      adminUserId: number
      userId: bigint
      grantedAt: Date
      grantedByAdminUserId: number
    }>,
    Error
  >
  findAllUsers(query?: UserSearchQuery): AsyncResult<UserListResult, Error>
}

export interface AdminCommand {
  grantAdminRole(userId: bigint, grantedByAdminUserId: number): AsyncResult<AdminUser, Error>
}
