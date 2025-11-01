import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { ServerError } from '@/common/errors'
import { AdminQueryImpl } from './adminQueryImpl'

// モックの設定
const mockDb = mockDeep<PrismaClient>()

// ヘルパー関数
function createMockAdminUser(overrides = {}) {
  return {
    adminUserId: 1,
    activeUserId: 123456789n,
    grantedAt: new Date('2024-01-15T09:30:15.123Z'),
    grantedByAdminUserId: 2,
    ...overrides,
  }
}

function createMockUsers() {
  return [
    {
      activeUserId: 1n,
      userId: 2n,
      email: 'test1@example.com',
      password: 'hashedPassword123',
      displayName: 'テストユーザー1',
      authenticationId: null,
      lastLogin: new Date('2024-01-15T09:30:15.123Z'),
      createdAt: new Date('2024-01-10T00:00:00.000Z'),
      updatedAt: new Date('2024-01-15T09:30:15.123Z'),
      adminUser: createMockAdminUser({ activeUserId: 1n }),
    },
    {
      activeUserId: 2n,
      userId: 3n,
      email: 'test2@example.com',
      password: 'hashedPassword456',
      displayName: 'テストユーザー2',
      authenticationId: null,
      lastLogin: null,
      createdAt: new Date('2024-01-11T00:00:00.000Z'),
      updatedAt: new Date('2024-01-11T00:00:00.000Z'),
      adminUser: null,
    },
  ]
}

function createMockUser(overrides = {}) {
  return {
    activeUserId: 1n,
    userId: 2n,
    email: 'test@example.com',
    password: 'hashedPassword123',
    displayName: 'テストユーザー',
    authenticationId: null,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    adminUser: null,
    ...overrides,
  }
}

function expectFindManyCall(expectedQuery: any) {
  expect(mockDb.activeUser.findMany).toHaveBeenCalledWith({
    where: expectedQuery.where || {},
    include: { adminUser: true },
    orderBy: { createdAt: 'desc' },
    skip: expectedQuery.skip || 0,
    take: expectedQuery.take || 20,
  })
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
  expect(isFailure(result)).toBe(true)
  if (isFailure(result)) {
    expect(result.error).toBeInstanceOf(errorType)
    expect(result.error.message).toContain(messageContains)
  }
}

function setupDatabaseError(mockMethod: any, errorMessage = 'Database connection failed') {
  mockMethod.mockRejectedValue(new Error(errorMessage))
}

describe('AdminQueryImpl', () => {
  let query: AdminQueryImpl
  const activeUserId = 123456789n

  beforeEach(() => {
    vi.clearAllMocks()
    query = new AdminQueryImpl(mockDb)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('findAdminByActiveUserId', () => {
    describe('基本動作', () => {
      it('ActiveUserIdでAdmin情報を検索できる', async () => {
        const mockAdminUser = createMockAdminUser({ activeUserId: activeUserId })
        mockDb.adminUser.findUnique.mockResolvedValue(mockAdminUser)

        const result = await query.findAdminByActiveUserId(activeUserId)

        expectSuccessResult(result, {
          adminUserId: 1,
          activeUserId,
          grantedAt: new Date('2024-01-15T09:30:15.123Z'),
          grantedByAdminUserId: 2,
        })
        expect(mockDb.adminUser.findUnique).toHaveBeenCalledWith({
          where: { activeUserId: activeUserId },
        })
      })

      it('異なるActiveUserIdで複数のAdmin情報を検索できる', async () => {
        const activeUserId2 = 987654321n
        mockDb.adminUser.findUnique.mockResolvedValueOnce(
          createMockAdminUser({ activeUserId: activeUserId }),
        )
        mockDb.adminUser.findUnique.mockResolvedValueOnce(
          createMockAdminUser({
            adminUserId: 3,
            activeUserId: activeUserId2,
            grantedByAdminUserId: 1,
          }),
        )

        const [result1, result2] = await Promise.all([
          query.findAdminByActiveUserId(activeUserId),
          query.findAdminByActiveUserId(activeUserId2),
        ])

        expectSuccessResult(result1, { adminUserId: 1, activeUserId })
        expectSuccessResult(result2, { adminUserId: 3, activeUserId: activeUserId2 })
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
          where: { activeUserId: nonExistentActiveUserId },
        })
      })

      it('bigintの最大値に近いActiveUserIdでも正常に処理できる', async () => {
        const largeActiveUserId = 9223372036854775806n
        mockDb.adminUser.findUnique.mockResolvedValue(
          createMockAdminUser({ activeUserId: largeActiveUserId }),
        )

        const result = await query.findAdminByActiveUserId(largeActiveUserId)

        expectSuccessResult(result, { activeUserId: largeActiveUserId })
        expect(isSuccess(result) && result.data?.activeUserId.toString()).toBe(
          '9223372036854775806',
        )
      })

      it('最小値のActiveUserIdでも正常に処理できる', async () => {
        const minActiveUserId = 1n
        mockDb.adminUser.findUnique.mockResolvedValue(
          createMockAdminUser({ activeUserId: minActiveUserId }),
        )

        const result = await query.findAdminByActiveUserId(minActiveUserId)

        expectSuccessResult(result, { activeUserId: minActiveUserId })
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        setupDatabaseError(mockDb.adminUser.findUnique)

        const result = await query.findAdminByActiveUserId(activeUserId)

        expectErrorResult(result, ServerError, 'Admin情報の取得に失敗しました')
      })

      it('Prismaクエリエラーを適切にハンドリングする', async () => {
        mockDb.adminUser.findUnique.mockRejectedValue({
          code: 'P2025',
          message: 'Record not found',
        })

        const result = await query.findAdminByActiveUserId(activeUserId)

        expectErrorResult(result, ServerError, 'Admin情報の取得に失敗しました')
      })
    })
  })

  describe('findAllUsers', () => {
    describe('基本動作', () => {
      it('全ユーザーを取得できる', async () => {
        const mockUsers = createMockUsers()
        mockDb.activeUser.findMany.mockResolvedValue(mockUsers)
        mockDb.activeUser.count.mockResolvedValue(2)

        const result = await query.findAllUsers()

        expectSuccessResult(result, { users: { length: 2 }, total: 2, page: 1, limit: 20 })
        expect(mockDb.activeUser.findMany).toHaveBeenCalledWith({
          where: {},
          include: { adminUser: true },
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 20,
        })
      })

      it('検索クエリでユーザーをフィルタリングできる', async () => {
        const searchQuery = { searchQuery: 'test1', page: 1, limit: 10 }
        const mockSearchUsers = [createMockUsers()[0]]
        mockDb.activeUser.findMany.mockResolvedValue(mockSearchUsers)
        mockDb.activeUser.count.mockResolvedValue(1)

        const result = await query.findAllUsers(searchQuery)

        expectSuccessResult(result, { users: { length: 1 }, total: 1, page: 1, limit: 10 })
        expectFindManyCall({
          where: {
            OR: [
              { email: { contains: 'test1', mode: 'insensitive' } },
              { displayName: { contains: 'test1', mode: 'insensitive' } },
            ],
          },
          take: 10,
        })
      })

      it('ページネーションが正しく動作する', async () => {
        const paginationQuery = { page: 2, limit: 5 }
        mockDb.activeUser.findMany.mockResolvedValue([
          createMockUser({ activeUserId: 6n, email: 'test6@example.com' }),
        ])
        mockDb.activeUser.count.mockResolvedValue(10)

        const result = await query.findAllUsers(paginationQuery)

        expectSuccessResult(result, { users: { length: 1 }, total: 10, page: 2, limit: 5 })
        expectFindManyCall({ skip: 5, take: 5 })
      })

      it('空の結果でも正常に処理できる', async () => {
        mockDb.activeUser.findMany.mockResolvedValue([])
        mockDb.activeUser.count.mockResolvedValue(0)

        const result = await query.findAllUsers()

        expectSuccessResult(result, { users: { length: 0 }, total: 0, page: 1, limit: 20 })
      })
    })

    describe('境界値・特殊値', () => {
      it('大きなページ番号でも正常に処理できる', async () => {
        const largePageQuery = { page: 1000, limit: 20 }
        mockDb.activeUser.findMany.mockResolvedValue([])
        mockDb.activeUser.count.mockResolvedValue(0)

        const result = await query.findAllUsers(largePageQuery)

        expectSuccessResult(result, { users: { length: 0 }, total: 0, page: 1000, limit: 20 })
        expectFindManyCall({ skip: 19980, take: 20 })
      })

      it('大きなlimit値でも正常に処理できる', async () => {
        const largeLimitQuery = { page: 1, limit: 1000 }
        const mockUsersLarge = Array.from({ length: 100 }, (_, i) =>
          createMockUser({
            activeUserId: BigInt(i + 1),
            email: `test${i + 1}@example.com`,
            displayName: `テストユーザー${i + 1}`,
          }),
        )
        mockDb.activeUser.findMany.mockResolvedValue(mockUsersLarge)
        mockDb.activeUser.count.mockResolvedValue(100)

        const result = await query.findAllUsers(largeLimitQuery)

        expectSuccessResult(result, { users: { length: 100 }, total: 100, page: 1, limit: 1000 })
        expectFindManyCall({ skip: 0, take: 1000 })
      })

      it('特殊文字を含む検索クエリでも正常に処理できる', async () => {
        const specialCharQuery = { searchQuery: 'test+special@domain.com', page: 1, limit: 20 }
        mockDb.activeUser.findMany.mockResolvedValue([])
        mockDb.activeUser.count.mockResolvedValue(0)

        const result = await query.findAllUsers(specialCharQuery)

        expectSuccessResult(result, { page: 1, limit: 20 })
        expectFindManyCall({
          where: {
            OR: [
              { email: { contains: 'test+special@domain.com', mode: 'insensitive' } },
              { displayName: { contains: 'test+special@domain.com', mode: 'insensitive' } },
            ],
          },
        })
      })

      it('日本語の検索クエリでも正常に処理できる', async () => {
        const japaneseQuery = { searchQuery: '田中太郎', page: 1, limit: 20 }
        const mockJapaneseUsers = [
          createMockUser({ email: 'tanaka@example.com', displayName: '田中太郎' }),
        ]
        mockDb.activeUser.findMany.mockResolvedValue(mockJapaneseUsers)
        mockDb.activeUser.count.mockResolvedValue(1)

        const result = await query.findAllUsers(japaneseQuery)

        expectSuccessResult(result, { users: { length: 1 }, page: 1, limit: 20 })
        if (isSuccess(result)) {
          expect(result.data.users[0].displayName).toBe('田中太郎')
        }
      })
    })

    describe('例外・制約違反', () => {
      it('findMany実行時のデータベースエラーを適切にエラーを返す', async () => {
        setupDatabaseError(mockDb.activeUser.findMany)

        const result = await query.findAllUsers()

        expectErrorResult(result, ServerError, 'ユーザ一覧の取得に失敗しました')
      })

      it('count実行時のデータベースエラーを適切にエラーを返す', async () => {
        mockDb.activeUser.findMany.mockResolvedValue([createMockUser()])
        setupDatabaseError(mockDb.activeUser.count)

        const result = await query.findAllUsers()

        expectErrorResult(result, ServerError, 'ユーザ一覧の取得に失敗しました')
      })

      it('Prismaクエリエラーを適切にハンドリングする', async () => {
        const prismaError = {
          code: 'P2021',
          message: 'The table does not exist in the current database.',
        }
        mockDb.activeUser.findMany.mockRejectedValue(prismaError)

        const result = await query.findAllUsers()

        expectErrorResult(result, ServerError, 'ユーザ一覧の取得に失敗しました')
      })
    })
  })
})
