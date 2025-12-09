import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { NotFoundError, ServerError } from '@/common/errors'
import { RoleCommandImpl } from './roleCommandImpl'

const mockDb = mockDeep<PrismaClient>()

describe('RoleCommandImpl', () => {
  let command: RoleCommandImpl

  beforeEach(() => {
    vi.clearAllMocks()
    command = new RoleCommandImpl(mockDb)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createRole', () => {
    it('正常にロールを作成できる', async () => {
      const mockCreatedRole = {
        roleId: 1,
        preset: false,
        displayName: 'Editor',
        description: 'Can edit articles',
        createdAt: new Date(),
      }

      mockDb.role.create.mockResolvedValue(mockCreatedRole)

      const result = await command.createRole({
        displayName: 'Editor',
        description: 'Can edit articles',
      })

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.roleId).toBe(1)
        expect(result.data.displayName).toBe('Editor')
        expect(result.data.description).toBe('Can edit articles')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.role.create.mockRejectedValue(new Error('DB Connection Error'))

      const result = await command.createRole({
        displayName: 'Editor',
        description: 'Can edit articles',
      })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('ロールの作成に失敗')
      }
    })
  })

  describe('updateRole', () => {
    it('正常にロールを更新できる', async () => {
      const mockExistingRole = {
        roleId: 1,
        preset: false,
        displayName: 'Editor',
        description: 'Can edit articles',
        createdAt: new Date(),
      }
      const mockUpdatedRole = {
        roleId: 1,
        preset: false,
        displayName: 'Senior Editor',
        description: 'Can edit and publish articles',
        createdAt: new Date(),
      }

      mockDb.role.findUnique.mockResolvedValue(mockExistingRole)
      mockDb.role.update.mockResolvedValue(mockUpdatedRole)

      const result = await command.updateRole(1, {
        displayName: 'Senior Editor',
        description: 'Can edit and publish articles',
      })

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.displayName).toBe('Senior Editor')
        expect(result.data.description).toBe('Can edit and publish articles')
      }
    })

    it('ロールが見つからない場合NotFoundErrorを返す', async () => {
      mockDb.role.findUnique.mockResolvedValue(null)

      const result = await command.updateRole(999, {
        displayName: 'Senior Editor',
        description: 'Can edit and publish articles',
      })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toBe('ロールが見つかりません')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.role.findUnique.mockRejectedValue(new Error('DB Error'))

      const result = await command.updateRole(1, {
        displayName: 'Senior Editor',
        description: 'Can edit and publish articles',
      })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('ロールの更新に失敗')
      }
    })
  })

  describe('deleteRole', () => {
    it('正常にロールを削除できる', async () => {
      const mockExistingRole = {
        roleId: 1,
        preset: false,
        displayName: 'Editor',
        description: 'Can edit articles',
        createdAt: new Date(),
      }

      mockDb.role.findUnique.mockResolvedValue(mockExistingRole)
      mockDb.role.delete.mockResolvedValue(mockExistingRole)

      const result = await command.deleteRole(1)

      expect(isSuccess(result)).toBe(true)
    })

    it('ロールが見つからない場合NotFoundErrorを返す', async () => {
      mockDb.role.findUnique.mockResolvedValue(null)

      const result = await command.deleteRole(999)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toBe('ロールが見つかりません')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.role.findUnique.mockRejectedValue(new Error('DB Error'))

      const result = await command.deleteRole(1)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('ロールの削除に失敗')
      }
    })
  })
})
