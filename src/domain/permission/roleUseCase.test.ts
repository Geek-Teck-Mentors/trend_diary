import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { NotFoundError } from '@/common/errors'
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
        { roleId: 1, displayName: 'admin', description: 'Administrator', createdAt: new Date(), preset: false },
        { roleId: 2, displayName: 'user', description: 'Regular User', createdAt: new Date(), preset: false },
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
        preset: false,
      }
      mockDb.role.findUnique.mockResolvedValue(mockRole)

      const result = await useCase.getRoleById(1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockRole)
      }
    })

    it('存在しないIDを指定した場合、nullを返す', async () => {
      mockDb.role.findUnique.mockResolvedValue(null)

      const result = await useCase.getRoleById(999)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeNull()
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
        // findPermissionsByRoleIdはPermission[]を返す
        expect(result.data).toEqual([
          { permissionId: 1, resource: 'article', action: 'read' },
          { permissionId: 2, resource: 'article', action: 'write' },
        ])
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
      const mockCreatedRole = { roleId: 3, ...input, createdAt: new Date(), preset: false }

      mockDb.role.create.mockResolvedValue(mockCreatedRole)

      const result = await useCase.createRole(input)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockCreatedRole)
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
        preset: false,
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
  })

  describe('deleteRole', () => {
    it('指定したIDのロールを削除できる', async () => {
      const mockRole = {
        roleId: 1,
        displayName: 'admin',
        description: 'Administrator',
        createdAt: new Date(),
        preset: false,
      }
      mockDb.role.findUnique.mockResolvedValue(mockRole)
      mockDb.role.delete.mockResolvedValue(mockRole)

      const result = await useCase.deleteRole(1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeUndefined()
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

      mockDb.role.findUnique.mockResolvedValue({
        roleId: 1,
        displayName: 'admin',
        description: 'Administrator',
        createdAt: new Date(),
        preset: false,
      })
      // biome-ignore lint/suspicious/noExplicitAny: mockImplementation requires any for generic callback
      mockDb.$transaction.mockImplementation((callback: any) => callback(mockDb))
      mockDb.rolePermission.deleteMany.mockResolvedValue({ count: 2 })
      mockDb.rolePermission.createMany.mockResolvedValue({ count: 2 })

      const result = await useCase.updateRolePermissions(roleId, newPermissionIds)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeUndefined()
      }
    })

    it('ロールの権限を全て削除できる', async () => {
      const roleId = 1
      const newPermissionIds: number[] = []

      mockDb.role.findUnique.mockResolvedValue({
        roleId: 1,
        displayName: 'admin',
        description: 'Administrator',
        createdAt: new Date(),
        preset: false,
      })
      // biome-ignore lint/suspicious/noExplicitAny: mockImplementation requires any for generic callback
      mockDb.$transaction.mockImplementation((callback: any) => callback(mockDb))
      mockDb.rolePermission.deleteMany.mockResolvedValue({ count: 2 })

      const result = await useCase.updateRolePermissions(roleId, newPermissionIds)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeUndefined()
      }
    })

    it('権限がない状態から新しい権限を追加できる', async () => {
      const roleId = 1
      const newPermissionIds = [1, 2]

      mockDb.role.findUnique.mockResolvedValue({
        roleId: 1,
        displayName: 'admin',
        description: 'Administrator',
        createdAt: new Date(),
        preset: false,
      })
      // biome-ignore lint/suspicious/noExplicitAny: mockImplementation requires any for generic callback
      mockDb.$transaction.mockImplementation((callback: any) => callback(mockDb))
      mockDb.rolePermission.deleteMany.mockResolvedValue({ count: 0 })
      mockDb.rolePermission.createMany.mockResolvedValue({ count: 2 })

      const result = await useCase.updateRolePermissions(roleId, newPermissionIds)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeUndefined()
      }
    })
  })
})
