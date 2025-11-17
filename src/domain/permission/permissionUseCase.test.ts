import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { AlreadyExistsError, NotFoundError } from '@/common/errors'
import { PermissionCommandImpl } from './infrastructure/permissionCommandImpl'
import { PermissionQueryImpl } from './infrastructure/queryImpl'
import { PermissionUseCase } from './permissionUseCase'

const mockDb = mockDeep<PrismaClient>()

describe('PermissionUseCase', () => {
  let useCase: PermissionUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    const permissionQuery = new PermissionQueryImpl(mockDb)
    const permissionCommand = new PermissionCommandImpl(mockDb)

    useCase = new PermissionUseCase(permissionQuery, permissionCommand)
  })

  describe('getAllPermissions', () => {
    it('全ての権限を取得できる', async () => {
      const mockPermissions = [
        { permissionId: 1, resource: 'article', action: 'read' },
        { permissionId: 2, resource: 'article', action: 'write' },
      ]
      mockDb.permission.findMany.mockResolvedValue(mockPermissions)

      const result = await useCase.getAllPermissions()

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockPermissions)
      }
    })

    it('権限が0件の場合、空の配列を返す', async () => {
      mockDb.permission.findMany.mockResolvedValue([])

      const result = await useCase.getAllPermissions()

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual([])
      }
    })
  })

  describe('getPermissionById', () => {
    it('指定したIDの権限を取得できる', async () => {
      const mockPermission = { permissionId: 1, resource: 'article', action: 'read' }
      mockDb.permission.findUnique.mockResolvedValue(mockPermission)

      const result = await useCase.getPermissionById(1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockPermission)
      }
    })

    it('存在しないIDを指定した場合、nullを返す', async () => {
      mockDb.permission.findUnique.mockResolvedValue(null)

      const result = await useCase.getPermissionById(999)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeNull()
      }
    })
  })

  describe('createPermission', () => {
    it('新しい権限を作成できる', async () => {
      const input = { resource: 'article', action: 'delete' }
      const mockCreatedPermission = { permissionId: 3, ...input }

      mockDb.permission.findUnique.mockResolvedValue(null)
      mockDb.permission.create.mockResolvedValue(mockCreatedPermission)

      const result = await useCase.createPermission(input)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockCreatedPermission)
      }
    })

    it('既に存在する権限を作成しようとした場合、AlreadyExistsErrorを返す', async () => {
      const input = { resource: 'article', action: 'read' }
      const existingPermission = { permissionId: 1, ...input }

      mockDb.permission.findUnique.mockResolvedValue(existingPermission)

      const result = await useCase.createPermission(input)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(AlreadyExistsError)
      }
    })
  })

  describe('deletePermission', () => {
    it('指定したIDの権限を削除できる', async () => {
      const mockPermission = { permissionId: 1, resource: 'article', action: 'read' }
      mockDb.permission.findUnique.mockResolvedValue(mockPermission)
      mockDb.permission.delete.mockResolvedValue(mockPermission)

      const result = await useCase.deletePermission(1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeUndefined()
      }
    })

    it('存在しないIDを指定した場合、NotFoundErrorを返す', async () => {
      mockDb.permission.findUnique.mockResolvedValue(null)

      const result = await useCase.deletePermission(999)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
      }
    })
  })
})
