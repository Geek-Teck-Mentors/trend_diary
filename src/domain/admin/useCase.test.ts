import { PrismaClient } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { isError, isSuccess } from '@/common/types/utility'
import { AdminCommandImpl } from './infrastructure/adminCommandImpl'
import { AdminQueryImpl } from './infrastructure/adminQueryImpl'
import { UseCase } from './useCase'

const mockDb = mockDeep<PrismaClient>()

describe('AdminUser UseCase', () => {
  let useCase: UseCase

  beforeEach(() => {
    vi.clearAllMocks()
    const command = new AdminCommandImpl(mockDb)
    const query = new AdminQueryImpl(mockDb)
    useCase = new UseCase(command, query)
  })

  describe('grantAdminRole', () => {
    describe('正常系', () => {
      it('Admin権限を正常に付与できる', async () => {
        // モックデータセットアップ
        mockDb.user.findUnique.mockResolvedValue({
          userId: BigInt(100),
          supabaseId: 'test-supabase-id',
          createdAt: new Date(),
        })

        mockDb.adminUser.findUnique.mockResolvedValue(null)

        mockDb.adminUser.create.mockResolvedValue({
          adminUserId: 1,
          userId: BigInt(100),
          grantedAt: new Date(),
          grantedByAdminUserId: 1,
        })

        const result = await useCase.grantAdminRole(BigInt(100), 1)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.userId).toBe(BigInt(100))
          expect(result.data.grantedByAdminUserId).toBe(1)
        }
      })
    })

    describe('準正常系', () => {
      it('存在しないユーザーの場合エラーを返す', async () => {
        mockDb.user.findUnique.mockResolvedValue(null)

        const result = await useCase.grantAdminRole(BigInt(999), 1)

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('ユーザーが見つかりません')
        }
      })

      it('既にAdmin権限を持つユーザーの場合エラーを返す', async () => {
        mockDb.user.findUnique.mockResolvedValue({
          userId: BigInt(100),
          supabaseId: 'test-supabase-id-admin',
          createdAt: new Date(),
        })

        mockDb.adminUser.findUnique.mockResolvedValue({
          adminUserId: 1,
          userId: BigInt(100),
          grantedAt: new Date(),
          grantedByAdminUserId: 1,
        })

        const result = await useCase.grantAdminRole(BigInt(100), 1)

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('既にAdmin権限を持っています')
        }
      })
    })
  })

  describe('isAdmin', () => {
    describe('正常系', () => {
      it('Admin権限を持つユーザーの場合trueを返す', async () => {
        mockDb.adminUser.findUnique.mockResolvedValue({
          adminUserId: 1,
          userId: BigInt(100),
          grantedAt: new Date(),
          grantedByAdminUserId: 1,
        })

        const result = await useCase.isAdmin(BigInt(100))

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBe(true)
        }
      })

      it('Admin権限を持たないユーザーの場合falseを返す', async () => {
        mockDb.adminUser.findUnique.mockResolvedValue(null)

        const result = await useCase.isAdmin(BigInt(200))

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBe(false)
        }
      })
    })
  })

  describe('getUserList', () => {
    describe('正常系', () => {
      it('ユーザー一覧を取得できる', async () => {
        const mockUsers = [
          {
            userId: BigInt(1),
            supabaseId: 'test-supabase-id-1',
            createdAt: new Date(),
            adminUser: {
              adminUserId: 1,
              grantedAt: new Date(),
              grantedByAdminUserId: 1,
            },
          },
          {
            userId: BigInt(2),
            supabaseId: 'test-supabase-id-2',
            createdAt: new Date(),
            adminUser: null,
          },
        ]

        mockDb.user.findMany.mockResolvedValue(mockUsers)
        mockDb.user.count.mockResolvedValue(2)

        const result = await useCase.getUserList()

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.users).toHaveLength(2)
          expect(result.data.total).toBe(2)
          expect(result.data.users[0].isAdmin).toBe(true)
          expect(result.data.users[1].isAdmin).toBe(false)
        }
      })

      it.skip('検索クエリでユーザーをフィルタリングできる', async () => {
        const mockUsers = [
          {
            email: 'admin@example.com',
            displayName: 'Admin User',
            password: 'hashedPassword',
            lastLogin: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: BigInt(1),
            adminUser: {
              adminUserId: 1,
              grantedAt: new Date(),
              grantedByAdminUserId: 1,
            },
          },
        ]

        mockDb.user.findMany.mockResolvedValue(mockUsers)
        mockDb.user.count.mockResolvedValue(1)

        const result = await useCase.getUserList({ searchQuery: 'admin' })

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.users).toHaveLength(1)
          expect(result.data.users[0].email).toBe('admin@example.com')
        }
      })
    })
  })
})
