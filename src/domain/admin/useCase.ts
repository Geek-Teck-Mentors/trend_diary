import { AsyncResult, isError, resultSuccess } from '@/common/types/utility'
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
    grantedByAdminUserId: number,
  ): AsyncResult<AdminUser, Error> {
    return await this.command.grantAdminRole(activeUserId, grantedByAdminUserId)
  }

  async isAdmin(activeUserId: bigint): AsyncResult<boolean, Error> {
    const result = await this.query.findAdminByActiveUserId(activeUserId)
    if (isError(result)) {
      return result
    }
    return resultSuccess(result.data !== null)
  }

  async getUserList(query?: UserSearchQuery): AsyncResult<UserListResult, Error> {
    return await this.query.findAllUsers(query)
  }
}
