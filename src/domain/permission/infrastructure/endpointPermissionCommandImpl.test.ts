import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { AlreadyExistsError, NotFoundError, ServerError } from '@/common/errors'
import { EndpointPermissionCommandImpl } from './endpointPermissionCommandImpl'

const mockDb = mockDeep<PrismaClient>()

describe('EndpointPermissionCommandImpl', () => {
  let command: EndpointPermissionCommandImpl

  beforeEach(() => {
    vi.clearAllMocks()
    command = new EndpointPermissionCommandImpl(mockDb)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('grantPermissionToEndpoint', () => {
    it('正常にパーミッションを付与できる', async () => {
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/articles',
        method: 'GET',
        createdAt: new Date(),
      }
      const mockPermission = {
        permissionId: 1,
        resource: 'article',
        action: 'read',
      }
      const mockEndpointPermission = {
        endpointId: 1,
        permissionId: 1,
      }

      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)
      mockDb.permission.findUnique.mockResolvedValue(mockPermission)
      mockDb.endpointPermission.findUnique.mockResolvedValue(null)
      mockDb.endpointPermission.create.mockResolvedValue(mockEndpointPermission)

      const result = await command.grantPermissionToEndpoint({ endpointId: 1, permissionId: 1 })

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.endpointId).toBe(1)
        expect(result.data.permissionId).toBe(1)
      }
    })

    it('エンドポイントが見つからない場合NotFoundErrorを返す', async () => {
      mockDb.endpoint.findUnique.mockResolvedValue(null)

      const result = await command.grantPermissionToEndpoint({ endpointId: 999, permissionId: 1 })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toBe('エンドポイントが見つかりません')
      }
    })

    it('パーミッションが見つからない場合NotFoundErrorを返す', async () => {
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/articles',
        method: 'GET',
        createdAt: new Date(),
      }

      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)
      mockDb.permission.findUnique.mockResolvedValue(null)

      const result = await command.grantPermissionToEndpoint({ endpointId: 1, permissionId: 999 })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toBe('パーミッションが見つかりません')
      }
    })

    it('既に付与されている場合AlreadyExistsErrorを返す', async () => {
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/articles',
        method: 'GET',
        createdAt: new Date(),
      }
      const mockPermission = {
        permissionId: 1,
        resource: 'article',
        action: 'read',
      }
      const mockExistingEndpointPermission = {
        endpointId: 1,
        permissionId: 1,
      }

      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)
      mockDb.permission.findUnique.mockResolvedValue(mockPermission)
      mockDb.endpointPermission.findUnique.mockResolvedValue(mockExistingEndpointPermission)

      const result = await command.grantPermissionToEndpoint({ endpointId: 1, permissionId: 1 })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(AlreadyExistsError)
        expect(result.error.message).toBe('既にこのパーミッションが付与されています')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.endpoint.findUnique.mockRejectedValue(new Error('DB Connection Error'))

      const result = await command.grantPermissionToEndpoint({ endpointId: 1, permissionId: 1 })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('パーミッションの付与に失敗')
      }
    })
  })

  describe('revokePermissionFromEndpoint', () => {
    it('正常にパーミッションを削除できる', async () => {
      const mockExistingEndpointPermission = {
        endpointId: 1,
        permissionId: 1,
      }

      mockDb.endpointPermission.findUnique.mockResolvedValue(mockExistingEndpointPermission)
      mockDb.endpointPermission.delete.mockResolvedValue(mockExistingEndpointPermission)

      const result = await command.revokePermissionFromEndpoint({ endpointId: 1, permissionId: 1 })

      expect(isSuccess(result)).toBe(true)
    })

    it('パーミッションが付与されていない場合NotFoundErrorを返す', async () => {
      mockDb.endpointPermission.findUnique.mockResolvedValue(null)

      const result = await command.revokePermissionFromEndpoint({
        endpointId: 1,
        permissionId: 999,
      })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toBe('このパーミッションは付与されていません')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.endpointPermission.findUnique.mockRejectedValue(new Error('DB Error'))

      const result = await command.revokePermissionFromEndpoint({ endpointId: 1, permissionId: 1 })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('パーミッションの削除に失敗')
      }
    })
  })

  describe('updateEndpointPermissions', () => {
    it('正常にトランザクションで一括更新できる', async () => {
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/articles',
        method: 'GET',
        createdAt: new Date(),
      }

      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)
      mockDb.$transaction.mockImplementation(async (callback) => {
        const tx = {
          endpointPermission: {
            deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
            createMany: vi.fn().mockResolvedValue({ count: 3 }),
          },
        }
        return callback(tx as any)
      })

      const result = await command.updateEndpointPermissions(1, [1, 2, 3])

      expect(isSuccess(result)).toBe(true)
    })

    it('エンドポイントが見つからない場合NotFoundErrorを返す', async () => {
      mockDb.endpoint.findUnique.mockResolvedValue(null)

      const result = await command.updateEndpointPermissions(999, [1, 2, 3])

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toBe('エンドポイントが見つかりません')
      }
    })

    it('空のpermissionIds配列でも正常動作する', async () => {
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/articles',
        method: 'GET',
        createdAt: new Date(),
      }

      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)
      mockDb.$transaction.mockImplementation(async (callback) => {
        const tx = {
          endpointPermission: {
            deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
          },
        }
        return callback(tx as any)
      })

      const result = await command.updateEndpointPermissions(1, [])

      expect(isSuccess(result)).toBe(true)
    })

    it('トランザクション失敗時にServerErrorを返す', async () => {
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/articles',
        method: 'GET',
        createdAt: new Date(),
      }

      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)
      mockDb.$transaction.mockRejectedValue(new Error('Transaction failed'))

      const result = await command.updateEndpointPermissions(1, [1, 2, 3])

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('エンドポイントパーミッションの更新に失敗')
      }
    })
  })
})
