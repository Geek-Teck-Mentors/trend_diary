import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { Nullable } from '@/common/types/utility'
import { AdminQuery } from '../repository'
import { UserListResult } from '../schema/userListSchema'
import { UserSearchQuery } from '../schema/userSearchSchema'
import { toUserListItem } from './mapper'

export class AdminQueryImpl implements AdminQuery {
  constructor(private rdb: PrismaClient) {}

  async findAdminByActiveUserId(activeUserId: bigint): AsyncResult<
    Nullable<{
      adminUserId: number
      activeUserId: bigint
      grantedAt: Date
      grantedByAdminUserId: number
    }>,
    Error
  > {
    try {
      const adminUser = await this.rdb.adminUser.findUnique({
        where: { activeUserId: activeUserId },
      })
      if (!adminUser) {
        return success(null)
      }

      return success({
        adminUserId: adminUser.adminUserId,
        activeUserId: adminUser.activeUserId,
        grantedAt: adminUser.grantedAt,
        grantedByAdminUserId: adminUser.grantedByAdminUserId,
      })
    } catch (error) {
      return failure(new ServerError(`Admin情報の取得に失敗しました: ${error}`))
    }
  }

  async findAllUsers(query?: UserSearchQuery): AsyncResult<UserListResult, Error> {
    try {
      const { searchQuery, page = 1, limit = 20 } = query || {}
      const offset = (page - 1) * limit

      const whereClause = searchQuery
        ? {
            OR: [
              { email: { contains: searchQuery, mode: 'insensitive' as const } },
              { displayName: { contains: searchQuery, mode: 'insensitive' as const } },
            ],
          }
        : {}

      const [users, total] = await Promise.all([
        this.rdb.activeUser.findMany({
          where: whereClause,
          include: {
            adminUser: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        this.rdb.activeUser.count({ where: whereClause }),
      ])

      const userList = users.map((user: any) => toUserListItem(user))

      return success({
        users: userList,
        total,
        page,
        limit,
      })
    } catch (error) {
      return failure(new ServerError(`ユーザ一覧の取得に失敗しました: ${error}`))
    }
  }
}
