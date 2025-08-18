import { PrismaClient } from '@prisma/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { AlreadyExistsError, NotFoundError, ServerError } from '@/common/errors'
import { isError, isSuccess } from '@/common/types/utility'
import { AdminCommandServiceImpl } from './adminCommandServiceImpl'

// モックの設定
const mockDb = mockDeep<PrismaClient>()

// ヘルパー関数
function createMockActiveUser(overrides = {}) {
  return {
    activeUserId: 123456789n,
    userId: 2n,
    email: 'test@example.com',
    password: 'hashedPassword123',
    displayName: 'テストユーザー',
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function createMockAdminUser(overrides = {}) {
  return {
    AdminUserId: 1,
    ActiveUserId: 123456789n,
    grantedAt: new Date(),
    grantedByAdminUserId: 1,
    ...overrides,
  }
}

function expectSuccessResult(result: any, expectations: Record<string, any>) {
  expect(isSuccess(result)).toBe(true)
  if (isSuccess(result)) {
    Object.entries(expectations).forEach(([key, value]) => {
      const data = result.data as Record<string, any>
      expect(data[key]).toBe(value)
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

function expectDatabaseCalls(calls: {
  activeUser?: any
  adminUserFind?: any
  adminUserCreate?: any
}) {
  if (calls.activeUser) {
    expect(mockDb.activeUser.findUnique).toHaveBeenCalledWith(calls.activeUser)
  }
  if (calls.adminUserFind) {
    expect(mockDb.adminUser.findUnique).toHaveBeenCalledWith(calls.adminUserFind)
  }
  if (calls.adminUserCreate) {
    expect(mockDb.adminUser.create).toHaveBeenCalledWith(calls.adminUserCreate)
  }
}

describe('AdminCommandServiceImpl', () => {
  let service: AdminCommandServiceImpl
  let testData: { activeUserId: bigint; grantedByAdminUserId: number }

  beforeEach(() => {
    testData = { activeUserId: 123456789n, grantedByAdminUserId: 1 }
    vi.clearAllMocks()
    service = new AdminCommandServiceImpl(mockDb)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('grantAdminRole', () => {
    describe('基本動作', () => {
      it('Admin権限を正常に付与できる', async () => {
        const mockActiveUser = createMockActiveUser()
        const mockAdminUser = createMockAdminUser()
        mockDb.activeUser.findUnique.mockResolvedValue(mockActiveUser)
        mockDb.adminUser.findUnique.mockResolvedValue(null)
        mockDb.adminUser.create.mockResolvedValue(mockAdminUser)

        const result = await service.grantAdminRole(
          testData.activeUserId,
          testData.grantedByAdminUserId,
        )

        expectSuccessResult(result, {
          adminUserId: 1,
          activeUserId: testData.activeUserId,
          grantedByAdminUserId: testData.grantedByAdminUserId,
        })
        expectDatabaseCalls({
          activeUser: { where: { activeUserId: testData.activeUserId } },
          adminUserFind: { where: { ActiveUserId: testData.activeUserId } },
          adminUserCreate: {
            data: {
              ActiveUserId: testData.activeUserId,
              grantedByAdminUserId: testData.grantedByAdminUserId,
            },
          },
        })
      })

      it('異なるactiveUserIdで複数のAdmin権限を付与できる', async () => {
        const activeUserId2 = 987654321n
        const mockActiveUser2 = createMockActiveUser({
          activeUserId: activeUserId2,
          email: 'test2@example.com',
          displayName: 'テストユーザー2',
        })
        const mockAdminUser2 = createMockAdminUser({ AdminUserId: 2, ActiveUserId: activeUserId2 })

        mockDb.activeUser.findUnique.mockResolvedValueOnce(createMockActiveUser())
        mockDb.adminUser.findUnique.mockResolvedValueOnce(null)
        mockDb.adminUser.create.mockResolvedValueOnce(createMockAdminUser())

        mockDb.activeUser.findUnique.mockResolvedValueOnce(mockActiveUser2)
        mockDb.adminUser.findUnique.mockResolvedValueOnce(null)
        mockDb.adminUser.create.mockResolvedValueOnce(mockAdminUser2)

        const [result1, result2] = await Promise.all([
          service.grantAdminRole(testData.activeUserId, testData.grantedByAdminUserId),
          service.grantAdminRole(activeUserId2, testData.grantedByAdminUserId),
        ])

        expectSuccessResult(result1, { activeUserId: testData.activeUserId })
        expectSuccessResult(result2, { activeUserId: activeUserId2 })
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しないactiveUserIdの場合NotFoundErrorを返す', async () => {
        const nonExistentActiveUserId = 999999999n
        mockDb.activeUser.findUnique.mockResolvedValue(null)

        const result = await service.grantAdminRole(
          nonExistentActiveUserId,
          testData.grantedByAdminUserId,
        )

        expectErrorResult(result, NotFoundError, 'ユーザーが見つかりません')
        expect(mockDb.activeUser.findUnique).toHaveBeenCalledWith({
          where: { activeUserId: nonExistentActiveUserId },
        })
        expect(mockDb.adminUser.findUnique).not.toHaveBeenCalled()
        expect(mockDb.adminUser.create).not.toHaveBeenCalled()
      })

      it('既にAdmin権限を持つユーザーの場合AlreadyExistsErrorを返す', async () => {
        const existingAdminUser = createMockAdminUser({ grantedByAdminUserId: 2 })
        mockDb.activeUser.findUnique.mockResolvedValue(createMockActiveUser())
        mockDb.adminUser.findUnique.mockResolvedValue(existingAdminUser)

        const result = await service.grantAdminRole(
          testData.activeUserId,
          testData.grantedByAdminUserId,
        )

        expectErrorResult(result, AlreadyExistsError, '既にAdmin権限を持っています')
        expectDatabaseCalls({
          activeUser: { where: { activeUserId: testData.activeUserId } },
          adminUserFind: { where: { ActiveUserId: testData.activeUserId } },
        })
        expect(mockDb.adminUser.create).not.toHaveBeenCalled()
      })

      it('bigintの最大値に近いactiveUserIdでも正常に処理できる', async () => {
        const largeActiveUserId = 9223372036854775806n
        mockDb.activeUser.findUnique.mockResolvedValue(
          createMockActiveUser({ activeUserId: largeActiveUserId }),
        )
        mockDb.adminUser.findUnique.mockResolvedValue(null)
        mockDb.adminUser.create.mockResolvedValue(
          createMockAdminUser({ ActiveUserId: largeActiveUserId }),
        )

        const result = await service.grantAdminRole(
          largeActiveUserId,
          testData.grantedByAdminUserId,
        )

        expectSuccessResult(result, { activeUserId: largeActiveUserId })
        if (isSuccess(result)) {
          expect(result.data.activeUserId.toString()).toBe('9223372036854775806')
        }
      })

      it('grantedByAdminUserIdの最大値でも正常に処理できる', async () => {
        const maxGrantedByAdminUserId = 2147483647
        mockDb.activeUser.findUnique.mockResolvedValue(createMockActiveUser())
        mockDb.adminUser.findUnique.mockResolvedValue(null)
        mockDb.adminUser.create.mockResolvedValue(
          createMockAdminUser({ grantedByAdminUserId: maxGrantedByAdminUserId }),
        )

        const result = await service.grantAdminRole(testData.activeUserId, maxGrantedByAdminUserId)

        expectSuccessResult(result, { grantedByAdminUserId: maxGrantedByAdminUserId })
      })
    })

    describe('例外・制約違反', () => {
      it('activeUser検索時のデータベースエラーを適切にエラーを返す', async () => {
        setupDatabaseError(mockDb.activeUser.findUnique)

        const result = await service.grantAdminRole(
          testData.activeUserId,
          testData.grantedByAdminUserId,
        )

        expectErrorResult(result, ServerError, 'Admin権限の付与に失敗しました')
      })

      it('adminUser検索時のデータベースエラーを適切にエラーを返す', async () => {
        mockDb.activeUser.findUnique.mockResolvedValue(createMockActiveUser())
        setupDatabaseError(mockDb.adminUser.findUnique)

        const result = await service.grantAdminRole(
          testData.activeUserId,
          testData.grantedByAdminUserId,
        )

        expectErrorResult(result, ServerError, 'Admin権限の付与に失敗しました')
      })

      it('adminUser作成時のデータベースエラーを適切にエラーを返す', async () => {
        mockDb.activeUser.findUnique.mockResolvedValue(createMockActiveUser())
        mockDb.adminUser.findUnique.mockResolvedValue(null)
        setupDatabaseError(mockDb.adminUser.create, 'Foreign key constraint failed')

        const result = await service.grantAdminRole(
          testData.activeUserId,
          testData.grantedByAdminUserId,
        )

        expectErrorResult(result, ServerError, 'Admin権限の付与に失敗しました')
      })

      it('Prisma制約違反エラーを適切にハンドリングする', async () => {
        const prismaError = {
          code: 'P2002',
          message: 'Unique constraint failed on the fields: (`ActiveUserId`)',
        }
        mockDb.activeUser.findUnique.mockResolvedValue(createMockActiveUser())
        mockDb.adminUser.findUnique.mockResolvedValue(null)
        mockDb.adminUser.create.mockRejectedValue(prismaError)

        const result = await service.grantAdminRole(
          testData.activeUserId,
          testData.grantedByAdminUserId,
        )

        expectErrorResult(result, ServerError, 'Admin権限の付与に失敗しました')
      })
    })
  })
})
