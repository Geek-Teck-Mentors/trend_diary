import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { AlreadyExistsError, NotFoundError, ServerError } from '@/common/errors'
import { RolePermissionCommandImpl } from './rolePermissionCommandImpl'

const mockDb = mockDeep<PrismaClient>()

describe('RolePermissionCommandImpl', () => {
  let command: RolePermissionCommandImpl

  beforeEach(() => {
    vi.clearAllMocks()
    command = new RolePermissionCommandImpl(mockDb)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('grantPermissionToRole', () => {
    it('正常にパーミッションを付与できる', async () => {
      const mockRole = {
        roleId: 1,
        roleName: 'admin',
      }
      const mockPermission = {
        permissionId: 1,
        resource: 'article',
        action: 'read',
      }
      const mockRolePermission = {
        roleId: 1,
        permissionId: 1,
      }

      mockDb.role.findUnique.mockResolvedValue(mockRole)
      mockDb.permission.findUnique.mockResolvedValue(mockPermission)
      mockDb.rolePermission.findUnique.mockResolvedValue(null)
      mockDb.rolePermission.create.mockResolvedValue(mockRolePermission)

      const result = await command.grantPermissionToRole({ roleId: 1, permissionId: 1 })

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.roleId).toBe(1)
        expect(result.data.permissionId).toBe(1)
      }
    })

    it('ロールが見つからない場合NotFoundErrorを返す', async () => {
      mockDb.role.findUnique.mockResolvedValue(null)

      const result = await command.grantPermissionToRole({ roleId: 999, permissionId: 1 })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toBe('ロールが見つかりません')
      }
    })

    it('パーミッションが見つからない場合NotFoundErrorを返す', async () => {
      const mockRole = {
        roleId: 1,
        roleName: 'admin',
      }

      mockDb.role.findUnique.mockResolvedValue(mockRole)
      mockDb.permission.findUnique.mockResolvedValue(null)

      const result = await command.grantPermissionToRole({ roleId: 1, permissionId: 999 })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toBe('パーミッションが見つかりません')
      }
    })

    it('既に付与されている場合AlreadyExistsErrorを返す', async () => {
      const mockRole = {
        roleId: 1,
        roleName: 'admin',
      }
      const mockPermission = {
        permissionId: 1,
        resource: 'article',
        action: 'read',
      }
      const mockExistingRolePermission = {
        roleId: 1,
        permissionId: 1,
      }

      mockDb.role.findUnique.mockResolvedValue(mockRole)
      mockDb.permission.findUnique.mockResolvedValue(mockPermission)
      mockDb.rolePermission.findUnique.mockResolvedValue(mockExistingRolePermission)

      const result = await command.grantPermissionToRole({ roleId: 1, permissionId: 1 })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(AlreadyExistsError)
        expect(result.error.message).toBe('既にこのパーミッションが付与されています')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.role.findUnique.mockRejectedValue(new Error('DB Connection Error'))

      const result = await command.grantPermissionToRole({ roleId: 1, permissionId: 1 })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('パーミッションの付与に失敗')
      }
    })
  })

  describe('revokePermissionFromRole', () => {
    it('正常にパーミッションを削除できる', async () => {
      const mockExistingRolePermission = {
        roleId: 1,
        permissionId: 1,
      }

      mockDb.rolePermission.findUnique.mockResolvedValue(mockExistingRolePermission)
      mockDb.rolePermission.delete.mockResolvedValue(mockExistingRolePermission)

      const result = await command.revokePermissionFromRole({ roleId: 1, permissionId: 1 })

      expect(isSuccess(result)).toBe(true)
    })

    it('パーミッションが付与されていない場合NotFoundErrorを返す', async () => {
      mockDb.rolePermission.findUnique.mockResolvedValue(null)

      const result = await command.revokePermissionFromRole({ roleId: 1, permissionId: 999 })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toBe('このパーミッションは付与されていません')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.rolePermission.findUnique.mockRejectedValue(new Error('DB Error'))

      const result = await command.revokePermissionFromRole({ roleId: 1, permissionId: 1 })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('パーミッションの削除に失敗')
      }
    })
  })

  describe('updateRolePermissions', () => {
    it('正常にトランザクションで一括更新できる', async () => {
      const mockRole = {
        roleId: 1,
        roleName: 'admin',
      }

      mockDb.role.findUnique.mockResolvedValue(mockRole)
      mockDb.$transaction.mockImplementation(async (callback) => {
        const tx = {
          rolePermission: {
            deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
            createMany: vi.fn().mockResolvedValue({ count: 3 }),
          },
        }
        return callback(tx as any)
      })

      const result = await command.updateRolePermissions(1, [1, 2, 3])

      expect(isSuccess(result)).toBe(true)
    })

    it('ロールが見つからない場合NotFoundErrorを返す', async () => {
      mockDb.role.findUnique.mockResolvedValue(null)

      const result = await command.updateRolePermissions(999, [1, 2, 3])

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toBe('ロールが見つかりません')
      }
    })

    it('空のpermissionIds配列でも正常動作する', async () => {
      const mockRole = {
        roleId: 1,
        roleName: 'admin',
      }

      mockDb.role.findUnique.mockResolvedValue(mockRole)
      mockDb.$transaction.mockImplementation(async (callback) => {
        const tx = {
          rolePermission: {
            deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
          },
        }
        return callback(tx as any)
      })

      const result = await command.updateRolePermissions(1, [])

      expect(isSuccess(result)).toBe(true)
    })

    it('トランザクション失敗時にServerErrorを返す', async () => {
      const mockRole = {
        roleId: 1,
        roleName: 'admin',
      }

      mockDb.role.findUnique.mockResolvedValue(mockRole)
      mockDb.$transaction.mockRejectedValue(new Error('Transaction failed'))

      const result = await command.updateRolePermissions(1, [1, 2, 3])

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('ロールパーミッションの更新に失敗')
      }
    })
  })
})
