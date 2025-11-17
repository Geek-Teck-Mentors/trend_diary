import { AsyncResult } from '@yuukihayashi0510/core'
import { AdminCommand, AdminQuery } from './repository'
import type { AdminUser } from './schema/adminUserSchema'
import { UserListResult } from './schema/userListSchema'
import { UserSearchQuery } from './schema/userSearchSchema'

export class UseCase {
  constructor(
    private command: AdminCommand,
    private query: AdminQuery,
  ) {}

  async grantAdminRole(
    activeUserId: bigint,
    grantedByActiveUserId: bigint,
  ): AsyncResult<AdminUser, Error> {
    return await this.command.grantAdminRole(activeUserId, grantedByActiveUserId)
  }

  async getUserList(query?: UserSearchQuery): AsyncResult<UserListResult, Error> {
    return await this.query.findAllUsers(query)
  }
}
