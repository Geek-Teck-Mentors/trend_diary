import { RdbClient } from '@/infrastructure/rdb'
import { AdminCommandImpl } from './infrastructure/adminCommandImpl'
import { AdminQueryImpl } from './infrastructure/adminQueryImpl'
import type { AdminQuery } from './repository'
import { UseCase } from './useCase'

export function createAdminUserUseCase(rdb: RdbClient): UseCase {
  const command = new AdminCommandImpl(rdb)
  const query = new AdminQueryImpl(rdb)
  return new UseCase(command, query)
}

export function createAdminQuery(rdb: RdbClient): AdminQuery {
  return new AdminQueryImpl(rdb)
}

export type { AdminUser, AdminUserInput as GrantAdminRoleInput } from './schema/adminUserSchema'
export * from './schema/adminUserSchema'
export type { UserListResult } from './schema/userListSchema'
export * from './schema/userListSchema'
export type { User } from './schema/userSchema'
export * from './schema/userSchema'
export type { UserSearchQuery } from './schema/userSearchSchema'
export * from './schema/userSearchSchema'
