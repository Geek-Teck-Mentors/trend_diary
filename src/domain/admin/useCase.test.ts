import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
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
        mockDb.activeUser.findUnique.mockResolvedValue({
          activeUserId: BigInt(100),
          email: 'user@example.com',
          password: 'hashedPassword',
          displayName: 'Test User',
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: BigInt(1),
        })

        mockDb.adminUser.findUnique.mockResolvedValue(null)

        mockDb.adminUser.create.mockResolvedValue({
          adminUserId: 1,
          activeUserId: BigInt(100),
          grantedAt: new Date(),
          grantedByAdminUserId: 1,
        })

        const result = await useCase.grantAdminRole(BigInt(100), 1)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.activeUserId).toBe(BigInt(100))
          expect(result.data.grantedByAdminUserId).toBe(1)
        }
      })
    })

    describe('準正常系', () => {
      it('存在しないユーザーの場合エラーを返す', async () => {
        mockDb.activeUser.findUnique.mockResolvedValue(null)

        const result = await useCase.grantAdminRole(BigInt(999), 1)

        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error.message).toBe('ユーザーが見つかりません')
        }
      })

      it('既にAdmin権限を持つユーザーの場合エラーを返す', async () => {
        mockDb.activeUser.findUnique.mockResolvedValue({
          activeUserId: BigInt(100),
          email: 'admin@example.com',
          password: 'hashedPassword',
          displayName: 'Admin User',
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: BigInt(1),
        })

        mockDb.adminUser.findUnique.mockResolvedValue({
          adminUserId: 1,
          activeUserId: BigInt(100),
          grantedAt: new Date(),
          grantedByAdminUserId: 1,
        })

        const result = await useCase.grantAdminRole(BigInt(100), 1)

        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
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
          activeUserId: BigInt(100),
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
            activeUserId: BigInt(100),
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
          {
            activeUserId: BigInt(200),
            email: 'user@example.com',
            displayName: 'Regular User',
            password: 'hashedPassword',
            lastLogin: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: BigInt(2),
            adminUser: null,
          },
        ]

        mockDb.activeUser.findMany.mockResolvedValue(mockUsers)
        mockDb.activeUser.count.mockResolvedValue(2)

        const result = await useCase.getUserList()

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.users).toHaveLength(2)
          expect(result.data.total).toBe(2)
          expect(result.data.users[0].isAdmin).toBe(true)
          expect(result.data.users[1].isAdmin).toBe(false)
        }
      })

      it('検索クエリでユーザーをフィルタリングできる', async () => {
        const mockUsers = [
          {
            activeUserId: BigInt(100),
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

        mockDb.activeUser.findMany.mockResolvedValue(mockUsers)
        mockDb.activeUser.count.mockResolvedValue(1)

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
