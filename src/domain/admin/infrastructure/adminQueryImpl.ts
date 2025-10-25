import { NotImplementedError, ServerError } from '@/common/errors'
import { AsyncResult, Nullable, resultError, resultSuccess } from '@/common/types/utility'
import { AdminQuery } from '../repository'
import { UserListResult } from '../schema/userListSchema'
import { UserSearchQuery } from '../schema/userSearchSchema'

export class AdminQueryImpl implements AdminQuery {
  constructor(private rdb: any) {}

  async findAdminByActiveUserId(userId: bigint): AsyncResult<
    Nullable<{
      adminUserId: number
      userId: bigint
      grantedAt: Date
      grantedByAdminUserId: number
    }>,
    Error
  > {
    try {
      const adminUser = await this.rdb.adminUser.findUnique({
        where: { userId: userId },
      })
      if (!adminUser) {
        return resultSuccess(null)
      }

      return resultSuccess({
        adminUserId: adminUser.adminUserId,
        userId: adminUser.userId,
        grantedAt: adminUser.grantedAt,
        grantedByAdminUserId: adminUser.grantedByAdminUserId,
      })
    } catch (error) {
      return resultError(new ServerError(`Admin情報の取得に失敗しました: ${error}`))
    }
  }

  async findAllUsers(query?: UserSearchQuery): AsyncResult<UserListResult, Error> {
    try {
      const { searchQuery, page = 1, limit = 20 } = query || {}
      const offset = (page - 1) * limit

      // 検索機能は未実装（Supabase Authからemail/displayNameを取得する必要がある）
      if (searchQuery) {
        return resultError(
          new NotImplementedError(
            'ユーザー検索機能は未実装です。Supabase Authとの統合が必要です。',
          ),
        )
      }

      const whereClause = {}

      const [users, total] = await Promise.all([
        this.rdb.user.findMany({
          where: whereClause,
          include: {
            adminUser: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        this.rdb.user.count({ where: whereClause }),
      ])

      const userList = users.map(
        (user: {
          userId: bigint
          createdAt: Date
          adminUser: { grantedAt: Date; grantedByAdminUserId: number } | null
        }) => ({
          userId: user.userId,
          email: 'email@placeholder.com', // TODO: Supabaseから取得
          displayName: null,
          isAdmin: user.adminUser !== null,
          grantedAt: user.adminUser?.grantedAt || null,
          grantedByAdminUserId: user.adminUser?.grantedByAdminUserId || null,
          createdAt: user.createdAt,
        }),
      )

      return resultSuccess({
        users: userList,
        total,
        page,
        limit,
      })
    } catch (error) {
      return resultError(new ServerError(`ユーザ一覧の取得に失敗しました: ${error}`))
    }
  }
}
