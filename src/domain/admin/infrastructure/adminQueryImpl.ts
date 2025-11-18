import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { AdminQuery } from '../repository'
import { UserListResult } from '../schema/userListSchema'
import { UserSearchQuery } from '../schema/userSearchSchema'
import { toUserListItem } from './mapper'

export class AdminQueryImpl implements AdminQuery {
  constructor(private rdb: PrismaClient) {}

  async findAllUsers(query?: UserSearchQuery): AsyncResult<UserListResult, Error> {
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

    const result = await wrapAsyncCall(() =>
      Promise.all([
        this.rdb.activeUser.findMany({
          where: whereClause,
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        this.rdb.activeUser.count({ where: whereClause }),
      ]),
    )
    if (isFailure(result)) {
      return failure(new ServerError(`ユーザ一覧の取得に失敗しました: ${result.error}`))
    }

    const [users, total] = result.data
    const userList = users.map((user) => toUserListItem(user))

    return success({
      users: userList,
      total,
      page,
      limit,
    })
  }
}
