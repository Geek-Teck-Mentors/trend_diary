import { AsyncResult, Nullable } from '@/common/types/utility'
import type { AdminUser } from './schema/adminUserSchema'
import { UserListResult } from './schema/userListSchema'
import { UserSearchQuery } from './schema/userSearchSchema'

export interface AdminQueryService {
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

export interface AdminCommandService {
  grantAdminRole(activeUserId: bigint, grantedByAdminUserId: number): AsyncResult<AdminUser, Error>
}
