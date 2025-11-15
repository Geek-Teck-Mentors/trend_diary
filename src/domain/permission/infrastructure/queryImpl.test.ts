import { type Prisma, PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { ServerError } from '@/common/errors'
import { PermissionQueryImpl } from './queryImpl'

const mockDb = mockDeep<PrismaClient>()

describe('PermissionQueryImpl', () => {
  let query: PermissionQueryImpl

  beforeEach(() => {
    vi.clearAllMocks()
    query = new PermissionQueryImpl(mockDb)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserPermissions', () => {
    it('ユーザーのパーミッション一覧を取得できる', async () => {
      mockDb.userRole.findMany.mockResolvedValue([
        {
          activeUserId: BigInt(1),
          roleId: 1,
          grantedAt: new Date(),
        },
      ])

      const mockRolePermissionWithPermission: Prisma.RolePermissionGetPayload<{
        include: { permission: true }
      }>[] = [
        {
          roleId: 1,
          permissionId: 1,
          permission: {
            permissionId: 1,
            resource: 'article',
            action: 'read',
          },
        },
      ]
      mockDb.rolePermission.findMany.mockResolvedValue(mockRolePermissionWithPermission)

      const result = await query.getUserPermissions(BigInt(1))

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].resource).toBe('article')
        expect(result.data[0].action).toBe('read')
      }
    })

    it('ロールがない場合空配列を返す', async () => {
      mockDb.userRole.findMany.mockResolvedValue([])

      const result = await query.getUserPermissions(BigInt(1))

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(0)
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.userRole.findMany.mockRejectedValue(new Error('DB Error'))

      const result = await query.getUserPermissions(BigInt(1))

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
      }
    })
  })

  describe('getRequiredPermissionsByEndpoint', () => {
    it('完全一致するエンドポイントの権限を取得できる', async () => {
      const mockEndpoint: Prisma.EndpointGetPayload<{
        include: { endpointPermissions: { include: { permission: true } } }
      }> = {
        endpointId: 1,
        path: '/api/admin/users',
        method: 'GET',
        endpointPermissions: [
          {
            endpointId: 1,
            permissionId: 1,
            permission: {
              permissionId: 1,
              resource: 'user',
              action: 'list',
            },
          },
        ],
      }
      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)

      const result = await query.getRequiredPermissionsByEndpoint('/api/admin/users', 'GET')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].resource).toBe('user')
        expect(result.data[0].action).toBe('list')
      }
    })

    it('パスパラメータを含むエンドポイントにマッチする', async () => {
      mockDb.endpoint.findUnique.mockResolvedValue(null)

      const mockEndpoints: Prisma.EndpointGetPayload<{
        include: { endpointPermissions: { include: { permission: true } } }
      }>[] = [
        {
          endpointId: 2,
          path: '/api/admin/users/:id',
          method: 'POST',
          endpointPermissions: [
            {
              endpointId: 2,
              permissionId: 2,
              permission: {
                permissionId: 2,
                resource: 'user',
                action: 'grant_admin',
              },
            },
          ],
        },
      ]
      mockDb.endpoint.findMany.mockResolvedValue(mockEndpoints)

      const result = await query.getRequiredPermissionsByEndpoint('/api/admin/users/123', 'POST')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].resource).toBe('user')
        expect(result.data[0].action).toBe('grant_admin')
      }
    })

    it('複数のパスパラメータを含むパターンにマッチする', async () => {
      mockDb.endpoint.findUnique.mockResolvedValue(null)

      const mockEndpoints: Prisma.EndpointGetPayload<{
        include: { endpointPermissions: { include: { permission: true } } }
      }>[] = [
        {
          endpointId: 3,
          path: '/api/policies/:version',
          method: 'GET',
          endpointPermissions: [
            {
              endpointId: 3,
              permissionId: 3,
              permission: {
                permissionId: 3,
                resource: 'privacy_policy',
                action: 'read',
              },
            },
          ],
        },
      ]
      mockDb.endpoint.findMany.mockResolvedValue(mockEndpoints)

      const result = await query.getRequiredPermissionsByEndpoint('/api/policies/1.0.0', 'GET')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].resource).toBe('privacy_policy')
        expect(result.data[0].action).toBe('read')
      }
    })

    it('マッチするエンドポイントがない場合空配列を返す', async () => {
      mockDb.endpoint.findUnique.mockResolvedValue(null)
      mockDb.endpoint.findMany.mockResolvedValue([])

      const result = await query.getRequiredPermissionsByEndpoint('/api/unknown', 'GET')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(0)
      }
    })

    it('メソッドが異なる場合マッチしない', async () => {
      mockDb.endpoint.findUnique.mockResolvedValue(null)
      mockDb.endpoint.findMany.mockResolvedValue([])

      const result = await query.getRequiredPermissionsByEndpoint('/api/admin/users/123', 'GET')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(0)
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.endpoint.findUnique.mockRejectedValue(new Error('DB Error'))

      const result = await query.getRequiredPermissionsByEndpoint('/api/admin/users', 'GET')

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
      }
    })
  })
})
