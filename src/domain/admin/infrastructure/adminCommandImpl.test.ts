import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it } from 'vitest'
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended'
import { AdminCommandImpl } from './adminCommandImpl'

let mockDb: DeepMockProxy<PrismaClient>
let adminCommandImpl: AdminCommandImpl

beforeEach(() => {
  mockDb = mockDeep<PrismaClient>()
  adminCommandImpl = new AdminCommandImpl(mockDb)
})

describe('AdminCommandImpl', () => {
  describe('grantAdminRole', () => {
    it('ユーザーにAdmin権限を付与できる', async () => {
      const activeUserId = 100n
      const grantedByActiveUserId = 1n

      // ユーザーが存在する
      mockDb.activeUser.findUnique.mockResolvedValue({
        activeUserId,
        userId: 50n,
        email: 'test@example.com',
        password: 'hashed',
        displayName: 'Test User',
        authenticationId: null,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // 管理者ロールが存在する
      mockDb.role.findFirst.mockResolvedValue({
        roleId: 2,
        displayName: '管理者',
        description: null,
        createdAt: new Date(),
        preset: true,
      })

      // まだAdmin権限を持っていない
      mockDb.userRole.findUnique.mockResolvedValue(null)

      // UserRoleを作成
      mockDb.userRole.create.mockResolvedValue({
        activeUserId,
        roleId: 2,
        grantedAt: new Date(),
        grantedByActiveUserId,
      })

      const result = await adminCommandImpl.grantAdminRole(activeUserId, grantedByActiveUserId)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.activeUserId).toBe(activeUserId)
        expect(result.data.adminUserId).toBe(2)
        expect(result.data.grantedByAdminUserId).toBe(grantedByActiveUserId)
      }
    })

    it('ユーザーが存在しない場合エラー', async () => {
      mockDb.activeUser.findUnique.mockResolvedValue(null)

      const result = await adminCommandImpl.grantAdminRole(100n, 1n)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.message).toContain('ユーザーが見つかりません')
      }
    })

    it('既にAdmin権限を持っている場合エラー', async () => {
      const activeUserId = 100n

      mockDb.activeUser.findUnique.mockResolvedValue({
        activeUserId,
        userId: 50n,
        email: 'test@example.com',
        password: 'hashed',
        displayName: 'Test User',
        authenticationId: null,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockDb.role.findFirst.mockResolvedValue({
        roleId: 2,
        displayName: '管理者',
        description: null,
        createdAt: new Date(),
        preset: true,
      })

      // 既にAdmin権限を持っている
      mockDb.userRole.findUnique.mockResolvedValue({
        activeUserId,
        roleId: 2,
        grantedAt: new Date(),
        grantedByActiveUserId: 1n,
      })

      const result = await adminCommandImpl.grantAdminRole(activeUserId, 1n)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.message).toContain('既にAdmin権限を持っています')
      }
    })
  })
})
