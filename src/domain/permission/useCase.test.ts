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
      mockDb.endpoint.findMany.mockResolvedValue([])

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

    it('ユーザーが別の権限を持っている場合falseを返す', async () => {
      // エンドポイントに必要な権限をモック（permissionId: 2が必要）
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/admin/users',
        method: 'POST',
        createdAt: new Date(),
        endpointPermissions: [
          {
            endpointId: 1,
            permissionId: 2,
            permission: {
              permissionId: 2,
              resource: 'user',
              action: 'create',
            },
          },
        ],
      }
      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)

      // ユーザーはpermissionId: 3を持っている（必要な権限とは異なる）
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
          permissionId: 3,
          permission: {
            permissionId: 3,
            resource: 'article',
            action: 'read',
          },
        },
      ]
      mockDb.rolePermission.findMany.mockResolvedValue(mockRolePermissionWithPermission)

      const result = await useCase.hasEndpointPermission(BigInt(1), '/api/admin/users', 'POST')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBe(false)
      }
    })

    it('複数の権限が必要な場合、一部の権限しか持っていない場合falseを返す', async () => {
      // エンドポイントに2つの権限が必要
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/admin/roles',
        method: 'POST',
        createdAt: new Date(),
        endpointPermissions: [
          {
            endpointId: 1,
            permissionId: 4,
            permission: {
              permissionId: 4,
              resource: 'role',
              action: 'create',
            },
          },
          {
            endpointId: 1,
            permissionId: 5,
            permission: {
              permissionId: 5,
              resource: 'role',
              action: 'assign',
            },
          },
        ],
      }
      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)

      // ユーザーはpermissionId: 4のみを持っている（permissionId: 5が不足）
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
          permissionId: 4,
          permission: {
            permissionId: 4,
            resource: 'role',
            action: 'create',
          },
        },
      ]
      mockDb.rolePermission.findMany.mockResolvedValue(mockRolePermissionWithPermission)

      const result = await useCase.hasEndpointPermission(BigInt(1), '/api/admin/roles', 'POST')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBe(false)
      }
    })

    it('複数の権限が必要な場合、全ての権限を持っている場合trueを返す', async () => {
      // エンドポイントに2つの権限が必要
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/admin/roles',
        method: 'POST',
        createdAt: new Date(),
        endpointPermissions: [
          {
            endpointId: 1,
            permissionId: 4,
            permission: {
              permissionId: 4,
              resource: 'role',
              action: 'create',
            },
          },
          {
            endpointId: 1,
            permissionId: 5,
            permission: {
              permissionId: 5,
              resource: 'role',
              action: 'assign',
            },
          },
        ],
      }
      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)

      // ユーザーは両方の権限を持っている
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
          permissionId: 4,
          permission: {
            permissionId: 4,
            resource: 'role',
            action: 'create',
          },
        },
        {
          roleId: 1,
          permissionId: 5,
          permission: {
            permissionId: 5,
            resource: 'role',
            action: 'assign',
          },
        },
      ]
      mockDb.rolePermission.findMany.mockResolvedValue(mockRolePermissionWithPermission)

      const result = await useCase.hasEndpointPermission(BigInt(1), '/api/admin/roles', 'POST')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBe(true)
      }
    })
  })
})
