import { ServerError } from '@/common/errors'
import { AsyncResult, Nullable, resultError, resultSuccess } from '@/common/types/utility'
import type { AuthSupabaseClient } from '@/infrastructure/auth/supabaseClient'
import { AdminQuery } from '../repository'
import { UserListResult } from '../schema/userListSchema'
import { UserSearchQuery } from '../schema/userSearchSchema'

export class AdminQueryImpl implements AdminQuery {
  constructor(
    private rdb: any,
    private supabase: AuthSupabaseClient,
  ) {}

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
      const _offset = (page - 1) * limit

      // Supabase Admin APIから全ユーザーを取得
      const { data: supabaseUsers, error: supabaseError } =
        await this.supabase.auth.admin.listUsers({
          page,
          perPage: limit,
        })

      if (supabaseError) {
        return resultError(
          new ServerError(`Supabaseからのユーザー取得に失敗: ${supabaseError.message}`),
        )
      }

      // 検索クエリでフィルタリング
      let filteredUsers = supabaseUsers.users
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase()
        filteredUsers = filteredUsers.filter((user) => {
          const email = user.email?.toLowerCase() || ''
          const displayName = user.user_metadata?.display_name?.toLowerCase() || ''
          return email.includes(lowerQuery) || displayName.includes(lowerQuery)
        })
      }

      // UserテーブルからsupabaseIdのリストを取得
      const supabaseIds = filteredUsers.map((u) => u.id)
      const dbUsers = await this.rdb.user.findMany({
        where: {
          supabaseId: { in: supabaseIds },
        },
        include: {
          adminUser: true,
        },
      })

      // supabaseIdでマッピングを作成
      const dbUserMap = new Map(
        dbUsers.map((u: any) => [
          u.supabaseId,
          u as { userId: bigint; adminUser: any; createdAt: Date },
        ]),
      )

      // 結合してユーザーリストを作成
      const userList = filteredUsers.map((supabaseUser) => {
        const dbUser = dbUserMap.get(supabaseUser.id) as
          | { userId: bigint; adminUser: any; createdAt: Date }
          | undefined
        return {
          userId: dbUser?.userId || 0n,
          email: supabaseUser.email || '',
          displayName: supabaseUser.user_metadata?.display_name || null,
          isAdmin: dbUser?.adminUser !== null && dbUser?.adminUser !== undefined,
          grantedAt: dbUser?.adminUser?.grantedAt || null,
          grantedByAdminUserId: dbUser?.adminUser?.grantedByAdminUserId || null,
          createdAt: dbUser?.createdAt || new Date(supabaseUser.created_at),
        }
      })

      return resultSuccess({
        users: userList,
        total: filteredUsers.length,
        page,
        limit,
      })
    } catch (error) {
      return resultError(new ServerError(`ユーザ一覧の取得に失敗しました: ${error}`))
    }
  }
}
