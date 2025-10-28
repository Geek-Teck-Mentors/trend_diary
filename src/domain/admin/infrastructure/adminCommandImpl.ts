import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
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
    try {
      // ユーザーが存在するかチェック
      const existingUser = await this.rdb.activeUser.findUnique({
        where: { activeUserId },
      })

      if (!existingUser) {
        return failure(new NotFoundError('ユーザーが見つかりません'))
      }

      // 既にAdmin権限を持っているかチェック
      const existingAdmin = await this.rdb.adminUser.findUnique({
        where: { activeUserId: activeUserId },
      })

      if (existingAdmin) {
        return failure(new AlreadyExistsError('既にAdmin権限を持っています'))
      }

      // Admin権限付与
      const adminUser = await this.rdb.adminUser.create({
        data: {
          activeUserId: activeUserId,
          grantedByAdminUserId,
        },
      })

      return success(toDomainAdminUser(adminUser))
    } catch (error) {
      return failure(new ServerError(`Admin権限の付与に失敗しました: ${error}`))
    }
  }
}
