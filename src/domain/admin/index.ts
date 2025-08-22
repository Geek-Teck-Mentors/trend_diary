import { RdbClient } from '@/infrastructure/rdb'
import { AdminCommandImpl } from './infrastructure/adminCommandImpl'
import { AdminQueryImpl } from './infrastructure/adminQueryImpl'
import { UseCase } from './useCase'

export function createAdminUserUseCase(rdb: RdbClient): UseCase {
  const commandService = new AdminCommandImpl(rdb)
  const queryService = new AdminQueryImpl(rdb)
  return new UseCase(commandService, queryService)
}

export type { AdminUser, AdminUserInput as GrantAdminRoleInput } from './schema/adminUserSchema'
export * from './schema/adminUserSchema'
export type { UserListResult } from './schema/userListSchema'
export * from './schema/userListSchema'
export type { User } from './schema/userSchema'
export * from './schema/userSchema'
export type { UserSearchQuery } from './schema/userSearchSchema'
export * from './schema/userSearchSchema'
