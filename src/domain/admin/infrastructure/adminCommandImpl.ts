import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { AlreadyExistsError, NotFoundError, ServerError } from '@/common/errors'
import { AdminCommand } from '../repository'
import type { AdminUser } from '../schema/adminUserSchema'
import { toDomainAdminUser } from './mapper'

export class AdminCommandImpl implements AdminCommand {
  constructor(private rdb: PrismaClient) {}

  async grantAdminRole(
    activeUserId: bigint,
    grantedByAdminUserId: number,
  ): AsyncResult<AdminUser, Error> {
    // ユーザーが存在するかチェック
    const existingUserResult = await wrapAsyncCall(() =>
      this.rdb.activeUser.findUnique({
        where: { activeUserId },
      }),
    )
    if (isFailure(existingUserResult)) {
      return failure(new ServerError(existingUserResult.error))
    }

    const existingUser = existingUserResult.data
    if (!existingUser) {
      return failure(new NotFoundError('ユーザーが見つかりません'))
    }

    // 既にAdmin権限を持っているかチェック
    const existingAdminResult = await wrapAsyncCall(() =>
      this.rdb.adminUser.findUnique({
        where: { activeUserId: activeUserId },
      }),
    )
    if (isFailure(existingAdminResult)) {
      return failure(new ServerError(existingAdminResult.error))
    }

    const existingAdmin = existingAdminResult.data
    if (existingAdmin) {
      return failure(new AlreadyExistsError('既にAdmin権限を持っています'))
    }

    // Admin権限付与
    const adminUserResult = await wrapAsyncCall(() =>
      this.rdb.adminUser.create({
        data: {
          activeUserId: activeUserId,
          grantedByAdminUserId,
        },
      }),
    )
    if (isFailure(adminUserResult)) {
      return failure(new ServerError(adminUserResult.error))
    }

    return success(toDomainAdminUser(adminUserResult.data))
  }
}
