import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { ServerError } from '@/common/errors'
import { isError, isSuccess } from '@/common/types/utility'
import type { AuthSupabaseClient } from '@/infrastructure/auth/supabaseClient'
import { AdminQueryImpl } from './adminQueryImpl'

// モックの設定
const mockDb = mockDeep<any>()
const mockSupabase = mockDeep<AuthSupabaseClient>()

// ヘルパー関数
function createMockAdminUser(overrides = {}) {
  return {
    adminUserId: 1,
    userId: 123456789n,
    grantedAt: new Date('2024-01-15T09:30:15.123Z'),
    grantedByAdminUserId: 2,
    ...overrides,
  }
}

function createMockUsers() {
  return [
    {
      userId: 2n,
      supabaseId: 'test-supabase-id-1',
      createdAt: new Date('2024-01-10T00:00:00.000Z'),
      adminUser: createMockAdminUser({ userId: 1n }),
    },
    {
      userId: 3n,
      supabaseId: 'test-supabase-id-2',
      createdAt: new Date('2024-01-11T00:00:00.000Z'),
      adminUser: null,
    },
  ]
}

function createMockUser(overrides = {}) {
  return {
    userId: 2n,
    supabaseId: 'test-supabase-id',
    createdAt: new Date(),
    ...overrides,
  }
}

function expectSuccessResult(result: any, expectations: Record<string, any>) {
  expect(isSuccess(result)).toBe(true)
  if (isSuccess(result)) {
    Object.entries(expectations).forEach(([key, value]) => {
      const data = result.data as Record<string, any>
      if (typeof value === 'object' && value !== null && 'length' in value) {
        expect(data[key]).toHaveLength(value.length)
      } else if (value instanceof Date) {
        expect(data[key]).toStrictEqual(value)
      } else {
        expect(data[key]).toBe(value)
      }
    })
  }
}

function expectErrorResult(result: any, errorType: any, messageContains: string) {
  expect(isError(result)).toBe(true)
  if (isError(result)) {
    expect(result.error).toBeInstanceOf(errorType)
    expect(result.error.message).toContain(messageContains)
  }
}

function setupDatabaseError(mockMethod: any, errorMessage = 'Database connection failed') {
  mockMethod.mockRejectedValue(new Error(errorMessage))
}

describe('AdminQueryImpl', () => {
  let query: AdminQueryImpl
  const userId = 123456789n

  beforeEach(() => {
    vi.clearAllMocks()
    query = new AdminQueryImpl(mockDb, mockSupabase)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('findAdminByActiveUserId', () => {
    describe('基本動作', () => {
      it('ActiveUserIdでAdmin情報を検索できる', async () => {
        const mockAdminUser = createMockAdminUser({ userId: userId })
        mockDb.adminUser.findUnique.mockResolvedValue(mockAdminUser)

        const result = await query.findAdminByActiveUserId(userId)

        expectSuccessResult(result, {
          adminUserId: 1,
          userId,
          grantedAt: new Date('2024-01-15T09:30:15.123Z'),
          grantedByAdminUserId: 2,
        })
        expect(mockDb.adminUser.findUnique).toHaveBeenCalledWith({
          where: { userId: userId },
        })
      })

      it('異なるActiveUserIdで複数のAdmin情報を検索できる', async () => {
        const userId2 = 987654321n
        mockDb.adminUser.findUnique.mockResolvedValueOnce(createMockAdminUser({ userId: userId }))
        mockDb.adminUser.findUnique.mockResolvedValueOnce(
          createMockAdminUser({
            adminUserId: 3,
            userId: userId2,
            grantedByAdminUserId: 1,
          }),
        )

        const [result1, result2] = await Promise.all([
          query.findAdminByActiveUserId(userId),
          query.findAdminByActiveUserId(userId2),
        ])

        expectSuccessResult(result1, { adminUserId: 1, userId })
        expectSuccessResult(result2, { adminUserId: 3, userId: userId2 })
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しないActiveUserIdの場合nullを返す', async () => {
        const nonExistentActiveUserId = 999999999n
        mockDb.adminUser.findUnique.mockResolvedValue(null)

        const result = await query.findAdminByActiveUserId(nonExistentActiveUserId)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeNull()
        }
        expect(mockDb.adminUser.findUnique).toHaveBeenCalledWith({
          where: { userId: nonExistentActiveUserId },
        })
      })

      it('bigintの最大値に近いActiveUserIdでも正常に処理できる', async () => {
        const largeActiveUserId = 9223372036854775806n
        mockDb.adminUser.findUnique.mockResolvedValue(
          createMockAdminUser({ userId: largeActiveUserId }),
        )

        const result = await query.findAdminByActiveUserId(largeActiveUserId)

        expectSuccessResult(result, { userId: largeActiveUserId })
        expect(isSuccess(result) && result.data?.userId.toString()).toBe('9223372036854775806')
      })

      it('最小値のActiveUserIdでも正常に処理できる', async () => {
        const minActiveUserId = 1n
        mockDb.adminUser.findUnique.mockResolvedValue(
          createMockAdminUser({ userId: minActiveUserId }),
        )

        const result = await query.findAdminByActiveUserId(minActiveUserId)

        expectSuccessResult(result, { userId: minActiveUserId })
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        setupDatabaseError(mockDb.adminUser.findUnique)

        const result = await query.findAdminByActiveUserId(userId)

        expectErrorResult(result, ServerError, 'Admin情報の取得に失敗しました')
      })

      it('Prismaクエリエラーを適切にハンドリングする', async () => {
        mockDb.adminUser.findUnique.mockRejectedValue({
          code: 'P2025',
          message: 'Record not found',
        })

        const result = await query.findAdminByActiveUserId(userId)

        expectErrorResult(result, ServerError, 'Admin情報の取得に失敗しました')
      })
    })
  })

  describe('findAllUsers', () => {
    describe('基本動作', () => {
      it('全ユーザーを取得できる', async () => {
        const mockSupabaseUsers = [
          {
            id: 'test-supabase-id-1',
            email: 'user1@example.com',
            user_metadata: { display_name: 'User 1' },
            created_at: '2024-01-10T00:00:00.000Z',
          },
          {
            id: 'test-supabase-id-2',
            email: 'user2@example.com',
            user_metadata: {},
            created_at: '2024-01-11T00:00:00.000Z',
          },
        ]
        mockSupabase.auth.admin.listUsers.mockResolvedValue({
          data: { users: mockSupabaseUsers },
          error: null,
        } as any)

        const mockUsers = createMockUsers()
        mockDb.user.findMany.mockResolvedValue(mockUsers)

        const result = await query.findAllUsers()

        expectSuccessResult(result, { users: { length: 2 }, total: 2, page: 1, limit: 20 })
        expect(mockSupabase.auth.admin.listUsers).toHaveBeenCalledWith({ page: 1, perPage: 20 })
      })

      it('検索クエリでユーザーをフィルタリングできる', async () => {
        const searchQuery = { searchQuery: 'user1', page: 1, limit: 10 }
        const mockSupabaseUsers = [
          {
            id: 'test-supabase-id-1',
            email: 'user1@example.com',
            user_metadata: { display_name: 'User 1' },
            created_at: '2024-01-10T00:00:00.000Z',
          },
          {
            id: 'test-supabase-id-2',
            email: 'user2@example.com',
            user_metadata: {},
            created_at: '2024-01-11T00:00:00.000Z',
          },
        ]
        mockSupabase.auth.admin.listUsers.mockResolvedValue({
          data: { users: mockSupabaseUsers },
          error: null,
        } as any)

        const mockUsers = [createMockUsers()[0]]
        mockDb.user.findMany.mockResolvedValue(mockUsers)

        const result = await query.findAllUsers(searchQuery)

        expectSuccessResult(result, { users: { length: 1 }, total: 1, page: 1, limit: 10 })
        expect(mockSupabase.auth.admin.listUsers).toHaveBeenCalledWith({ page: 1, perPage: 10 })
      })

      it('ページネーションが正しく動作する', async () => {
        const paginationQuery = { page: 2, limit: 5 }
        const mockSupabaseUsers = [
          {
            id: 'test-supabase-id-6',
            email: 'test6@example.com',
            user_metadata: { display_name: 'User 6' },
            created_at: '2024-01-16T00:00:00.000Z',
          },
        ]
        mockSupabase.auth.admin.listUsers.mockResolvedValue({
          data: { users: mockSupabaseUsers },
          error: null,
        } as any)

        mockDb.user.findMany.mockResolvedValue([
          createMockUser({
            userId: 6n,
            supabaseId: 'test-supabase-id-6',
            email: 'test6@example.com',
          }),
        ])

        const result = await query.findAllUsers(paginationQuery)

        expectSuccessResult(result, { users: { length: 1 }, total: 1, page: 2, limit: 5 })
        expect(mockSupabase.auth.admin.listUsers).toHaveBeenCalledWith({ page: 2, perPage: 5 })
      })

      it('空の結果でも正常に処理できる', async () => {
        mockSupabase.auth.admin.listUsers.mockResolvedValue({
          data: { users: [] },
          error: null,
        } as any)
        mockDb.user.findMany.mockResolvedValue([])

        const result = await query.findAllUsers()

        expectSuccessResult(result, { users: { length: 0 }, total: 0, page: 1, limit: 20 })
      })
    })

    describe('境界値・特殊値', () => {
      it('大きなページ番号でも正常に処理できる', async () => {
        const largePageQuery = { page: 1000, limit: 20 }
        mockSupabase.auth.admin.listUsers.mockResolvedValue({
          data: { users: [] },
          error: null,
        } as any)
        mockDb.user.findMany.mockResolvedValue([])

        const result = await query.findAllUsers(largePageQuery)

        expectSuccessResult(result, { users: { length: 0 }, total: 0, page: 1000, limit: 20 })
        expect(mockSupabase.auth.admin.listUsers).toHaveBeenCalledWith({ page: 1000, perPage: 20 })
      })

      it('大きなlimit値でも正常に処理できる', async () => {
        const largeLimitQuery = { page: 1, limit: 1000 }
        const mockSupabaseUsersLarge = Array.from({ length: 100 }, (_, i) => ({
          id: `test-supabase-id-${i + 1}`,
          email: `test${i + 1}@example.com`,
          user_metadata: { display_name: `テストユーザー${i + 1}` },
          created_at: '2024-01-10T00:00:00.000Z',
        }))
        mockSupabase.auth.admin.listUsers.mockResolvedValue({
          data: { users: mockSupabaseUsersLarge },
          error: null,
        } as any)

        const mockUsersLarge = Array.from({ length: 100 }, (_, i) =>
          createMockUser({
            userId: BigInt(i + 1),
            supabaseId: `test-supabase-id-${i + 1}`,
            email: `test${i + 1}@example.com`,
            displayName: `テストユーザー${i + 1}`,
          }),
        )
        mockDb.user.findMany.mockResolvedValue(mockUsersLarge)

        const result = await query.findAllUsers(largeLimitQuery)

        expectSuccessResult(result, { users: { length: 100 }, total: 100, page: 1, limit: 1000 })
        expect(mockSupabase.auth.admin.listUsers).toHaveBeenCalledWith({ page: 1, perPage: 1000 })
      })

      it('特殊文字を含む検索クエリでも正常に処理できる', async () => {
        const specialCharQuery = { searchQuery: 'test+special@domain.com', page: 1, limit: 20 }
        const mockSupabaseUsers = [
          {
            id: 'test-id',
            email: 'test+special@domain.com',
            user_metadata: {},
            created_at: '2024-01-10T00:00:00.000Z',
          },
        ]
        mockSupabase.auth.admin.listUsers.mockResolvedValue({
          data: { users: mockSupabaseUsers },
          error: null,
        } as any)
        mockDb.user.findMany.mockResolvedValue([])

        const result = await query.findAllUsers(specialCharQuery)

        expectSuccessResult(result, { page: 1, limit: 20 })
      })

      it('日本語の検索クエリでも正常に処理できる', async () => {
        const japaneseQuery = { searchQuery: '田中太郎', page: 1, limit: 20 }
        const mockSupabaseUsers = [
          {
            id: 'test-id',
            email: 'tanaka@example.com',
            user_metadata: { display_name: '田中太郎' },
            created_at: '2024-01-10T00:00:00.000Z',
          },
        ]
        mockSupabase.auth.admin.listUsers.mockResolvedValue({
          data: { users: mockSupabaseUsers },
          error: null,
        } as any)
        mockDb.user.findMany.mockResolvedValue([createMockUser({ supabaseId: 'test-id' })])

        const result = await query.findAllUsers(japaneseQuery)

        expectSuccessResult(result, { users: { length: 1 }, page: 1, limit: 20 })
        if (isSuccess(result)) {
          expect(result.data.users[0].displayName).toBe('田中太郎')
        }
      })
    })

    describe('例外・制約違反', () => {
      it('findMany実行時のデータベースエラーを適切にエラーを返す', async () => {
        setupDatabaseError(mockDb.user.findMany)

        const result = await query.findAllUsers()

        expectErrorResult(result, ServerError, 'ユーザ一覧の取得に失敗しました')
      })

      it('Supabase Admin APIエラー時は適切にエラーを返す', async () => {
        mockSupabase.auth.admin.listUsers.mockResolvedValue({
          data: { users: [] },
          error: { message: 'Service unavailable' },
        } as any)

        const result = await query.findAllUsers()

        expectErrorResult(result, ServerError, 'Supabaseからのユーザー取得に失敗')
      })

      it('Prismaクエリエラーを適切にハンドリングする', async () => {
        const mockSupabaseUsers = [
          {
            id: 'test-supabase-id-1',
            email: 'test1@example.com',
            user_metadata: {},
            created_at: '2024-01-10T00:00:00.000Z',
          },
        ]
        mockSupabase.auth.admin.listUsers.mockResolvedValue({
          data: { users: mockSupabaseUsers },
          error: null,
        } as any)

        const prismaError = {
          code: 'P2021',
          message: 'The table does not exist in the current database.',
        }
        mockDb.user.findMany.mockRejectedValue(prismaError)

        const result = await query.findAllUsers()

        expectErrorResult(result, ServerError, 'ユーザ一覧の取得に失敗しました')
      })
    })
  })
})
