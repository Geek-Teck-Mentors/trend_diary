import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { AlreadyExistsError, NotFoundError, ServerError } from '@/common/errors'
import { EndpointCommandImpl } from './endpointCommandImpl'

const mockDb = mockDeep<PrismaClient>()

describe('EndpointCommandImpl', () => {
  let command: EndpointCommandImpl

  beforeEach(() => {
    vi.clearAllMocks()
    command = new EndpointCommandImpl(mockDb)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createEndpoint', () => {
    it('正常にエンドポイントを作成できる', async () => {
      const mockCreatedEndpoint = {
        endpointId: 1,
        path: '/api/articles',
        method: 'GET',
        createdAt: new Date(),
      }

      mockDb.endpoint.findUnique.mockResolvedValue(null)
      mockDb.endpoint.create.mockResolvedValue(mockCreatedEndpoint)

      const result = await command.createEndpoint({
        path: '/api/articles',
        method: 'GET',
      })

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.endpointId).toBe(1)
        expect(result.data.path).toBe('/api/articles')
        expect(result.data.method).toBe('GET')
      }
    })

    it('既に存在する場合AlreadyExistsErrorを返す', async () => {
      const mockExistingEndpoint = {
        endpointId: 1,
        path: '/api/articles',
        method: 'GET',
        createdAt: new Date(),
      }

      mockDb.endpoint.findUnique.mockResolvedValue(mockExistingEndpoint)

      const result = await command.createEndpoint({
        path: '/api/articles',
        method: 'GET',
      })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(AlreadyExistsError)
        expect(result.error.message).toBe('同じパスとメソッドのエンドポイントが既に存在します')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.endpoint.findUnique.mockRejectedValue(new Error('DB Connection Error'))

      const result = await command.createEndpoint({
        path: '/api/articles',
        method: 'GET',
      })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('エンドポイントの作成に失敗')
      }
    })
  })

  describe('deleteEndpoint', () => {
    it('正常にエンドポイントを削除できる', async () => {
      const mockExistingEndpoint = {
        endpointId: 1,
        path: '/api/articles',
        method: 'GET',
        createdAt: new Date(),
      }

      mockDb.endpoint.findUnique.mockResolvedValue(mockExistingEndpoint)
      mockDb.endpoint.delete.mockResolvedValue(mockExistingEndpoint)

      const result = await command.deleteEndpoint(1)

      expect(isSuccess(result)).toBe(true)
    })

    it('エンドポイントが見つからない場合NotFoundErrorを返す', async () => {
      mockDb.endpoint.findUnique.mockResolvedValue(null)

      const result = await command.deleteEndpoint(999)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toBe('エンドポイントが見つかりません')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.endpoint.findUnique.mockRejectedValue(new Error('DB Error'))

      const result = await command.deleteEndpoint(1)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('エンドポイントの削除に失敗')
      }
    })
  })
})
