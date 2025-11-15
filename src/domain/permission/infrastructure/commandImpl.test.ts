import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { NotFoundError, ServerError } from '@/common/errors'
import { PermissionCommandImpl } from './commandImpl'

const mockDb = mockDeep<PrismaClient>()

describe('PermissionCommandImpl', () => {
  let command: PermissionCommandImpl

  beforeEach(() => {
    vi.clearAllMocks()
    command = new PermissionCommandImpl(mockDb)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('assignRole', () => {
    const input = {
      activeUserId: BigInt(1),
      roleId: 1,
    }

    it('ロールを正常に付与できる', async () => {
      mockDb.activeUser.findUnique.mockResolvedValue({
        activeUserId: BigInt(1),
        email: 'test@example.com',
        password: 'hashed',
        displayName: 'Test User',
        authenticationId: null,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: BigInt(1),
      })

      mockDb.role.findUnique.mockResolvedValue({
        roleId: 1,
        displayName: '管理者',
        description: 'テスト',
        createdAt: new Date(),
      })

      mockDb.userRole.create.mockResolvedValue({
        activeUserId: BigInt(1),
        roleId: 1,
        grantedAt: new Date(),
      })

      const result = await command.assignRole(input)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.activeUserId).toBe(BigInt(1))
        expect(result.data.roleId).toBe(1)
      }
    })

    it('ユーザーが存在しない場合エラーを返す', async () => {
      mockDb.activeUser.findUnique.mockResolvedValue(null)

      const result = await command.assignRole(input)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toContain('ユーザーが見つからない')
      }
    })

    it('ロールが存在しない場合エラーを返す', async () => {
      mockDb.activeUser.findUnique.mockResolvedValue({
        activeUserId: BigInt(1),
        email: 'test@example.com',
        password: 'hashed',
        displayName: 'Test User',
        authenticationId: null,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: BigInt(1),
      })

      mockDb.role.findUnique.mockResolvedValue(null)

      const result = await command.assignRole(input)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toContain('ロールが見つからない')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.activeUser.findUnique.mockRejectedValue(new Error('DB Error'))

      const result = await command.assignRole(input)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
      }
    })
  })

  describe('revokeRole', () => {
    const input = {
      activeUserId: BigInt(1),
      roleId: 1,
    }

    it('ロールを正常に剥奪できる', async () => {
      mockDb.userRole.findUnique.mockResolvedValue({
        activeUserId: BigInt(1),
        roleId: 1,
        grantedAt: new Date(),
      })

      mockDb.userRole.delete.mockResolvedValue({
        activeUserId: BigInt(1),
        roleId: 1,
        grantedAt: new Date(),
      })

      const result = await command.revokeRole(input)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.activeUserId).toBe(BigInt(1))
        expect(result.data.roleId).toBe(1)
      }
    })

    it('ユーザーロールが存在しない場合エラーを返す', async () => {
      mockDb.userRole.findUnique.mockResolvedValue(null)

      const result = await command.revokeRole(input)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toContain('ユーザーロールが見つからない')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.userRole.findUnique.mockRejectedValue(new Error('DB Error'))

      const result = await command.revokeRole(input)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
      }
    })
  })
})
