import { PrismaClient } from '@prisma/client'
import { isSuccess } from '@yuukihayashi0510/core'
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
    it('Admin権限を正常に付与できる', async () => {
      // モックデータセットアップ
      mockDb.activeUser.findUnique.mockResolvedValue({
        activeUserId: BigInt(100),
        email: 'user@example.com',
        password: 'hashedPassword',
        displayName: 'Test User',
        authenticationId: null,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: BigInt(1),
      })

      mockDb.role.findFirst.mockResolvedValue({
        roleId: 2,
        displayName: '管理者',
        description: null,
        createdAt: new Date(),
      })

      mockDb.userRole.findUnique.mockResolvedValue(null)

      mockDb.userRole.create.mockResolvedValue({
        activeUserId: BigInt(100),
        roleId: 2,
        grantedAt: new Date(),
        grantedByActiveUserId: BigInt(1),
      })

      const result = await useCase.grantAdminRole(BigInt(100), BigInt(1))

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.activeUserId).toBe(BigInt(100))
        expect(result.data.adminUserId).toBe(2)
      }
    })
  })

  describe('getUserList', () => {
    it('ユーザーリストを取得できる', async () => {
      mockDb.activeUser.findMany.mockResolvedValue([
        {
          activeUserId: BigInt(1),
          email: 'test@example.com',
          password: 'hashed',
          displayName: 'Test User',
          authenticationId: null,
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: BigInt(1),
          userRoles: [],
        },
        // biome-ignore lint/suspicious/noExplicitAny: includeを含むモックデータのため型が複雑
      ] as any)

      mockDb.activeUser.count.mockResolvedValue(1)

      const result = await useCase.getUserList()

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.users).toHaveLength(1)
        expect(result.data.total).toBe(1)
      }
    })
  })
})
