import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { AlreadyExistsError, NotFoundError } from '@/common/errors'
import { RoleCommandImpl } from './infrastructure/roleCommandImpl'
import { RolePermissionCommandImpl } from './infrastructure/rolePermissionCommandImpl'
import { RoleQueryImpl } from './infrastructure/roleQueryImpl'
import { RoleUseCase } from './roleUseCase'

const mockDb = mockDeep<PrismaClient>()

describe('RoleUseCase', () => {
  let useCase: RoleUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    const roleQuery = new RoleQueryImpl(mockDb)
    const roleCommand = new RoleCommandImpl(mockDb)
    const rolePermissionCommand = new RolePermissionCommandImpl(mockDb)

    useCase = new RoleUseCase(roleQuery, roleCommand, rolePermissionCommand)
  })

  describe('getAllRoles', () => {
    it('全てのロールを取得できる', async () => {
      const mockRoles = [
        { roleId: 1, displayName: 'admin', description: 'Administrator', createdAt: new Date() },
        { roleId: 2, displayName: 'user', description: 'Regular User', createdAt: new Date() },
      ]
      mockDb.role.findMany.mockResolvedValue(mockRoles)

      const result = await useCase.getAllRoles()

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockRoles)
      }
    })

    it('ロールが0件の場合、空の配列を返す', async () => {
      mockDb.role.findMany.mockResolvedValue([])

      const result = await useCase.getAllRoles()

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual([])
      }
    })
  })

  describe('getRoleById', () => {
    it('指定したIDのロールを取得できる', async () => {
      const mockRole = {
        roleId: 1,
        displayName: 'admin',
        description: 'Administrator',
        createdAt: new Date(),
      }
      mockDb.role.findUnique.mockResolvedValue(mockRole)

      const result = await useCase.getRoleById(1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockRole)
      }
    })

    it('存在しないIDを指定した場合、NotFoundErrorを返す', async () => {
      mockDb.role.findUnique.mockResolvedValue(null)

      const result = await useCase.getRoleById(999)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
      }
    })
  })

  describe('getPermissionsByRoleId', () => {
    it('指定したロールIDに紐づく権限を取得できる', async () => {
      const mockRolePermissions = [
        {
          roleId: 1,
          permissionId: 1,
          permission: { permissionId: 1, resource: 'article', action: 'read' },
        },
        {
          roleId: 1,
          permissionId: 2,
          permission: { permissionId: 2, resource: 'article', action: 'write' },
        },
      ]
      mockDb.rolePermission.findMany.mockResolvedValue(mockRolePermissions)

      const result = await useCase.getPermissionsByRoleId(1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockRolePermissions)
      }
    })

    it('権限が0件の場合、空の配列を返す', async () => {
      mockDb.rolePermission.findMany.mockResolvedValue([])

      const result = await useCase.getPermissionsByRoleId(1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual([])
      }
    })
  })

  describe('createRole', () => {
    it('新しいロールを作成できる', async () => {
      const input = { displayName: 'moderator', description: 'Moderator role' }
      const mockCreatedRole = { roleId: 3, ...input, createdAt: new Date() }

      mockDb.role.findFirst.mockResolvedValue(null)
      mockDb.role.create.mockResolvedValue(mockCreatedRole)

      const result = await useCase.createRole(input)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockCreatedRole)
      }
    })

    it('既に存在するロール名で作成しようとした場合、AlreadyExistsErrorを返す', async () => {
      const input = { displayName: 'admin', description: 'Administrator' }
      const existingRole = { roleId: 1, ...input, createdAt: new Date() }

      mockDb.role.findFirst.mockResolvedValue(existingRole)

      const result = await useCase.createRole(input)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(AlreadyExistsError)
      }
    })
  })

  describe('updateRole', () => {
    it('指定したIDのロールを更新できる', async () => {
      const input = { displayName: 'super-admin', description: 'Super Administrator' }
      const existingRole = {
        roleId: 1,
        displayName: 'admin',
        description: 'Administrator',
        createdAt: new Date(),
      }
      const updatedRole = { ...existingRole, ...input }

      mockDb.role.findUnique.mockResolvedValue(existingRole)
      mockDb.role.findFirst.mockResolvedValue(null)
      mockDb.role.update.mockResolvedValue(updatedRole)

      const result = await useCase.updateRole(1, input)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(updatedRole)
      }
    })

    it('存在しないIDを指定した場合、NotFoundErrorを返す', async () => {
      const input = { displayName: 'super-admin', description: 'Super Administrator' }
      mockDb.role.findUnique.mockResolvedValue(null)

      const result = await useCase.updateRole(999, input)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
      }
    })

    it('既に存在するロール名で更新しようとした場合、AlreadyExistsErrorを返す', async () => {
      const input = { displayName: 'user', description: 'Updated description' }
      const existingRole = {
        roleId: 1,
        displayName: 'admin',
        description: 'Administrator',
        createdAt: new Date(),
      }
      const conflictingRole = {
        roleId: 2,
        displayName: 'user',
        description: 'Regular User',
        createdAt: new Date(),
      }

      mockDb.role.findUnique.mockResolvedValue(existingRole)
      mockDb.role.findFirst.mockResolvedValue(conflictingRole)

      const result = await useCase.updateRole(1, input)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(AlreadyExistsError)
      }
    })
  })

  describe('deleteRole', () => {
    it('指定したIDのロールを削除できる', async () => {
      const mockRole = {
        roleId: 1,
        displayName: 'admin',
        description: 'Administrator',
        createdAt: new Date(),
      }
      mockDb.role.findUnique.mockResolvedValue(mockRole)
      mockDb.role.delete.mockResolvedValue(mockRole)

      const result = await useCase.deleteRole(1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockRole)
      }
    })

    it('存在しないIDを指定した場合、NotFoundErrorを返す', async () => {
      mockDb.role.findUnique.mockResolvedValue(null)

      const result = await useCase.deleteRole(999)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
      }
    })
  })

  describe('updateRolePermissions', () => {
    it('ロールの権限を更新できる（新しい権限を追加、既存の権限を削除）', async () => {
      const roleId = 1
      const newPermissionIds = [2, 3]
      const existingRolePermissions = [
        { roleId, permissionId: 1 },
        { roleId, permissionId: 2 },
      ]

      // 既存の権限を取得
      mockDb.rolePermission.findMany.mockResolvedValue(existingRolePermissions)
      // 削除する権限（permissionId: 1）
      mockDb.rolePermission.delete.mockResolvedValue(existingRolePermissions[0])
      // 追加する権限（permissionId: 3）
      mockDb.rolePermission.findUnique.mockResolvedValue(null)
      mockDb.rolePermission.create.mockResolvedValue({ roleId, permissionId: 3 })

      const result = await useCase.updateRolePermissions(roleId, newPermissionIds)

      expect(isSuccess(result)).toBe(true)
    })

    it('ロールの権限を全て削除できる', async () => {
      const roleId = 1
      const newPermissionIds: number[] = []
      const existingRolePermissions = [
        { roleId, permissionId: 1 },
        { roleId, permissionId: 2 },
      ]

      mockDb.rolePermission.findMany.mockResolvedValue(existingRolePermissions)
      mockDb.rolePermission.delete.mockResolvedValue(existingRolePermissions[0])

      const result = await useCase.updateRolePermissions(roleId, newPermissionIds)

      expect(isSuccess(result)).toBe(true)
    })

    it('権限がない状態から新しい権限を追加できる', async () => {
      const roleId = 1
      const newPermissionIds = [1, 2]

      mockDb.rolePermission.findMany.mockResolvedValue([])
      mockDb.rolePermission.findUnique.mockResolvedValue(null)
      mockDb.rolePermission.create.mockResolvedValue({ roleId, permissionId: 1 })

      const result = await useCase.updateRolePermissions(roleId, newPermissionIds)

      expect(isSuccess(result)).toBe(true)
    })
  })
})
