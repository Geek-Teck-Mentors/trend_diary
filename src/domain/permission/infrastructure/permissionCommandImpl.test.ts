import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { AlreadyExistsError, NotFoundError, ServerError } from '@/common/errors'
import { PermissionCommandImpl } from './permissionCommandImpl'

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

  describe('createPermission', () => {
    it('正常にパーミッションを作成できる', async () => {
      const mockCreatedPermission = {
        permissionId: 1,
        resource: 'article',
        action: 'read',
      }

      mockDb.permission.findUnique.mockResolvedValue(null)
      mockDb.permission.create.mockResolvedValue(mockCreatedPermission)

      const result = await command.createPermission({
        resource: 'article',
        action: 'read',
      })

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.permissionId).toBe(1)
        expect(result.data.resource).toBe('article')
        expect(result.data.action).toBe('read')
      }
    })

    it('既に存在する場合AlreadyExistsErrorを返す', async () => {
      const mockExistingPermission = {
        permissionId: 1,
        resource: 'article',
        action: 'read',
      }

      mockDb.permission.findUnique.mockResolvedValue(mockExistingPermission)

      const result = await command.createPermission({
        resource: 'article',
        action: 'read',
      })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(AlreadyExistsError)
        expect(result.error.message).toBe('同じリソースとアクションの権限が既に存在します')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.permission.findUnique.mockRejectedValue(new Error('DB Connection Error'))

      const result = await command.createPermission({
        resource: 'article',
        action: 'read',
      })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('パーミッションの作成に失敗')
      }
    })
  })

  describe('deletePermission', () => {
    it('正常にパーミッションを削除できる', async () => {
      const mockExistingPermission = {
        permissionId: 1,
        resource: 'article',
        action: 'read',
      }

      mockDb.permission.findUnique.mockResolvedValue(mockExistingPermission)
      mockDb.permission.delete.mockResolvedValue(mockExistingPermission)

      const result = await command.deletePermission(1)

      expect(isSuccess(result)).toBe(true)
    })

    it('パーミッションが見つからない場合NotFoundErrorを返す', async () => {
      mockDb.permission.findUnique.mockResolvedValue(null)

      const result = await command.deletePermission(999)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toBe('パーミッションが見つかりません')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.permission.findUnique.mockRejectedValue(new Error('DB Error'))

      const result = await command.deletePermission(1)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('パーミッションの削除に失敗')
      }
    })
  })
})
