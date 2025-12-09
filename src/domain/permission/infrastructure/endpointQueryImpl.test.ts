import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { ServerError } from '@/common/errors'
import { EndpointQueryImpl } from './endpointQueryImpl'

const mockDb = mockDeep<PrismaClient>()

describe('EndpointQueryImpl', () => {
  let query: EndpointQueryImpl

  beforeEach(() => {
    vi.clearAllMocks()
    query = new EndpointQueryImpl(mockDb)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('findAllEndpoints', () => {
    it('全てのエンドポイントを取得できる', async () => {
      const mockEndpoints = [
        {
          endpointId: 1,
          path: '/api/articles',
          method: 'GET',
          createdAt: new Date(),
        },
        {
          endpointId: 2,
          path: '/api/articles',
          method: 'POST',
          createdAt: new Date(),
        },
      ]

      mockDb.endpoint.findMany.mockResolvedValue(mockEndpoints)

      const result = await query.findAllEndpoints()

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0].endpointId).toBe(1)
        expect(result.data[0].path).toBe('/api/articles')
        expect(result.data[0].method).toBe('GET')
        expect(result.data[1].endpointId).toBe(2)
        expect(result.data[1].method).toBe('POST')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.endpoint.findMany.mockRejectedValue(new Error('DB Error'))

      const result = await query.findAllEndpoints()

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('エンドポイント一覧の取得に失敗')
      }
    })
  })

  describe('findEndpointById', () => {
    it('指定したIDのエンドポイントを取得できる', async () => {
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/articles',
        method: 'GET',
        createdAt: new Date(),
      }

      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)

      const result = await query.findEndpointById(1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).not.toBeNull()
        expect(result.data?.endpointId).toBe(1)
        expect(result.data?.path).toBe('/api/articles')
        expect(result.data?.method).toBe('GET')
      }
    })

    it('エンドポイントが存在しない場合nullを返す', async () => {
      mockDb.endpoint.findUnique.mockResolvedValue(null)

      const result = await query.findEndpointById(999)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeNull()
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.endpoint.findUnique.mockRejectedValue(new Error('DB Error'))

      const result = await query.findEndpointById(1)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('エンドポイントの取得に失敗')
      }
    })
  })

  describe('findPermissionsByEndpointId', () => {
    it('指定したエンドポイントIDのパーミッション一覧を取得できる', async () => {
      const mockEndpointPermissions = [
        {
          endpointId: 1,
          permissionId: 1,
          permission: {
            permissionId: 1,
            resource: 'article',
            action: 'read',
          },
        },
        {
          endpointId: 1,
          permissionId: 2,
          permission: {
            permissionId: 2,
            resource: 'article',
            action: 'write',
          },
        },
      ]

      mockDb.endpointPermission.findMany.mockResolvedValue(mockEndpointPermissions as any)

      const result = await query.findPermissionsByEndpointId(1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0].resource).toBe('article')
        expect(result.data[0].action).toBe('read')
        expect(result.data[1].resource).toBe('article')
        expect(result.data[1].action).toBe('write')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.endpointPermission.findMany.mockRejectedValue(new Error('DB Error'))

      const result = await query.findPermissionsByEndpointId(1)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('エンドポイントのパーミッション取得に失敗')
      }
    })
  })
})
