import { RdbClient } from '@/infrastructure/rdb'
import { AdminCommandServiceImpl } from './infrastructure/adminCommandServiceImpl'
import { AdminQueryServiceImpl } from './infrastructure/adminQueryServiceImpl'
import { AdminUserService } from './service/adminUserService'

export function createAdminUserService(rdb: RdbClient): AdminUserService {
  const commandService = new AdminCommandServiceImpl(rdb)
  const queryService = new AdminQueryServiceImpl(rdb)
  return new AdminUserService(commandService, queryService)
}

export type { AdminUser, AdminUserInput as GrantAdminRoleInput } from './schema/adminUserSchema'
export * from './schema/adminUserSchema'
export type { UserListResult } from './schema/userListSchema'
export * from './schema/userListSchema'
export type { User } from './schema/userSchema'
export * from './schema/userSchema'
export type { UserSearchQuery } from './schema/userSearchSchema'
export * from './schema/userSearchSchema'
export { AdminUserService } from './service/adminUserService'
