import { type Prisma, PrismaClient } from '@prisma/client'
import { isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { PermissionQueryImpl } from './infrastructure/queryImpl'
import { UseCase } from './useCase'

const mockDb = mockDeep<PrismaClient>()

describe('Permission UseCase', () => {
  let useCase: UseCase

  beforeEach(() => {
    vi.clearAllMocks()
    const query = new PermissionQueryImpl(mockDb)
    useCase = new UseCase(query)
  })

  describe('hasEndpointPermission', () => {
    it('ユーザーが必要な権限を全て持っている場合trueを返す', async () => {
      // エンドポイントに必要な権限をモック
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/articles',
        method: 'GET',
        createdAt: new Date(),
        endpointPermissions: [
          {
            endpointId: 1,
            permissionId: 1,
            permission: {
              permissionId: 1,
              resource: 'article',
              action: 'list',
            },
          },
        ],
      }
      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)

      // ユーザーの権限をモック
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
            action: 'list',
          },
        },
      ]
      mockDb.rolePermission.findMany.mockResolvedValue(mockRolePermissionWithPermission)

      const result = await useCase.hasEndpointPermission(BigInt(1), '/api/articles', 'GET')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBe(true)
      }
    })

    it('エンドポイントが登録されていない場合trueを返す（後方互換性）', async () => {
      mockDb.endpoint.findUnique.mockResolvedValue(null)

      const result = await useCase.hasEndpointPermission(BigInt(1), '/api/unknown', 'GET')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBe(true)
      }
    })

    it('ユーザーが権限を持っていない場合falseを返す', async () => {
      // エンドポイントに必要な権限をモック
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/admin/users',
        method: 'GET',
        createdAt: new Date(),
        endpointPermissions: [
          {
            endpointId: 1,
            permissionId: 2,
            permission: {
              permissionId: 2,
              resource: 'user',
              action: 'list',
            },
          },
        ],
      }
      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)

      // ユーザーは権限を持っていない
      mockDb.userRole.findMany.mockResolvedValue([])

      const result = await useCase.hasEndpointPermission(BigInt(1), '/api/admin/users', 'GET')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBe(false)
      }
    })
  })
})
