import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { findAdminRole } from '@/domain/user/infrastructure/permissionChecker'
import { AdminQuery } from '../repository'
import { UserListResult } from '../schema/userListSchema'
import { UserSearchQuery } from '../schema/userSearchSchema'
import { toUserListItem, UserWithRolesRow } from './mapper'

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

    // 各ユーザーの管理者権限情報を計算
    const usersWithAdminInfo = users.map((user) => {
      // 管理者権限を持つロールを見つける
      const adminRole = findAdminRole(user.userRoles)

      const userWithAdminInfo: UserWithRolesRow = {
        activeUserId: user.activeUserId,
        email: user.email,
        displayName: user.displayName,
        authenticationId: user.authenticationId,
        createdAt: user.createdAt,
        hasAdminAccess: !!adminRole,
        adminGrantedAt: adminRole?.grantedAt || null,
        adminGrantedByUserId: adminRole?.grantedByActiveUserId || null,
      }

      return userWithAdminInfo
    })

    const userList = usersWithAdminInfo.map((user) => toUserListItem(user))

    return success({
      users: userList,
      total,
      page,
      limit,
    })
  }
}
