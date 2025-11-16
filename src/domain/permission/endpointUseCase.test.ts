import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { NotFoundError } from '@/common/errors'
import { EndpointUseCase } from './endpointUseCase'
import { EndpointCommandImpl } from './infrastructure/endpointCommandImpl'
import { EndpointPermissionCommandImpl } from './infrastructure/endpointPermissionCommandImpl'
import { EndpointQueryImpl } from './infrastructure/endpointQueryImpl'

const mockDb = mockDeep<PrismaClient>()

describe('EndpointUseCase', () => {
  let useCase: EndpointUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    const endpointQuery = new EndpointQueryImpl(mockDb)
    const endpointCommand = new EndpointCommandImpl(mockDb)
    const endpointPermissionCommand = new EndpointPermissionCommandImpl(mockDb)

    useCase = new EndpointUseCase(endpointQuery, endpointCommand, endpointPermissionCommand)
  })

  describe('getAllEndpoints', () => {
    it('全てのエンドポイントを取得できる', async () => {
      const mockEndpoints = [
        { endpointId: 1, path: '/api/articles', method: 'GET', createdAt: new Date() },
        { endpointId: 2, path: '/api/articles', method: 'POST', createdAt: new Date() },
      ]
      mockDb.endpoint.findMany.mockResolvedValue(mockEndpoints)

      const result = await useCase.getAllEndpoints()

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockEndpoints)
      }
    })

    it('エンドポイントが0件の場合、空の配列を返す', async () => {
      mockDb.endpoint.findMany.mockResolvedValue([])

      const result = await useCase.getAllEndpoints()

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual([])
      }
    })
  })

  describe('getEndpointById', () => {
    it('指定したIDのエンドポイントを取得できる', async () => {
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/articles',
        method: 'GET',
        createdAt: new Date(),
      }
      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)

      const result = await useCase.getEndpointById(1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockEndpoint)
      }
    })

    it('存在しないIDを指定した場合、nullを返す', async () => {
      mockDb.endpoint.findUnique.mockResolvedValue(null)

      const result = await useCase.getEndpointById(999)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeNull()
      }
    })
  })

  describe('getPermissionsByEndpointId', () => {
    it('指定したエンドポイントIDに紐づく権限を取得できる', async () => {
      const mockEndpointPermissions = [
        {
          endpointId: 1,
          permissionId: 1,
          permission: { permissionId: 1, resource: 'article', action: 'read' },
        },
        {
          endpointId: 1,
          permissionId: 2,
          permission: { permissionId: 2, resource: 'article', action: 'write' },
        },
      ]
      mockDb.endpointPermission.findMany.mockResolvedValue(mockEndpointPermissions)

      const result = await useCase.getPermissionsByEndpointId(1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        // findPermissionsByEndpointIdはPermission[]を返す
        expect(result.data).toEqual([
          { permissionId: 1, resource: 'article', action: 'read' },
          { permissionId: 2, resource: 'article', action: 'write' },
        ])
      }
    })

    it('権限が0件の場合、空の配列を返す', async () => {
      mockDb.endpointPermission.findMany.mockResolvedValue([])

      const result = await useCase.getPermissionsByEndpointId(1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual([])
      }
    })
  })

  describe('createEndpoint', () => {
    it('新しいエンドポイントを作成できる', async () => {
      const input = { path: '/api/users', method: 'GET' }
      const mockCreatedEndpoint = { endpointId: 3, ...input, createdAt: new Date() }

      mockDb.endpoint.create.mockResolvedValue(mockCreatedEndpoint)

      const result = await useCase.createEndpoint(input)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockCreatedEndpoint)
      }
    })
  })

  describe('deleteEndpoint', () => {
    it('指定したIDのエンドポイントを削除できる', async () => {
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/articles',
        method: 'GET',
        createdAt: new Date(),
      }
      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)
      mockDb.endpoint.delete.mockResolvedValue(mockEndpoint)

      const result = await useCase.deleteEndpoint(1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeUndefined()
      }
    })

    it('存在しないIDを指定した場合、NotFoundErrorを返す', async () => {
      mockDb.endpoint.findUnique.mockResolvedValue(null)

      const result = await useCase.deleteEndpoint(999)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
      }
    })
  })

  describe('updateEndpointPermissions', () => {
    it('エンドポイントの権限を更新できる（新しい権限を追加、既存の権限を削除）', async () => {
      const endpointId = 1
      const newPermissionIds = [2, 3]

      mockDb.endpoint.findUnique.mockResolvedValue({
        endpointId: 1,
        path: '/api/test',
        method: 'GET',
        createdAt: new Date(),
      })
      mockDb.$transaction.mockImplementation((callback: any) => callback(mockDb))
      mockDb.endpointPermission.deleteMany.mockResolvedValue({ count: 2 })
      mockDb.endpointPermission.createMany.mockResolvedValue({ count: 2 })

      const result = await useCase.updateEndpointPermissions(endpointId, newPermissionIds)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeUndefined()
      }
    })

    it('エンドポイントの権限を全て削除できる', async () => {
      const endpointId = 1
      const newPermissionIds: number[] = []

      mockDb.endpoint.findUnique.mockResolvedValue({
        endpointId: 1,
        path: '/api/test',
        method: 'GET',
        createdAt: new Date(),
      })
      mockDb.$transaction.mockImplementation((callback: any) => callback(mockDb))
      mockDb.endpointPermission.deleteMany.mockResolvedValue({ count: 2 })

      const result = await useCase.updateEndpointPermissions(endpointId, newPermissionIds)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeUndefined()
      }
    })

    it('権限がない状態から新しい権限を追加できる', async () => {
      const endpointId = 1
      const newPermissionIds = [1, 2]

      mockDb.endpoint.findUnique.mockResolvedValue({
        endpointId: 1,
        path: '/api/test',
        method: 'GET',
        createdAt: new Date(),
      })
      mockDb.$transaction.mockImplementation((callback: any) => callback(mockDb))
      mockDb.endpointPermission.deleteMany.mockResolvedValue({ count: 0 })
      mockDb.endpointPermission.createMany.mockResolvedValue({ count: 2 })

      const result = await useCase.updateEndpointPermissions(endpointId, newPermissionIds)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeUndefined()
      }
    })
  })
})
