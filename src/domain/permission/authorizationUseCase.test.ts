import { type Prisma, PrismaClient } from '@prisma/client'
import { isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { AuthorizationUseCase } from './authorizationUseCase'
import { PermissionQueryImpl } from './infrastructure/queryImpl'

const mockDb = mockDeep<PrismaClient>()

describe('AuthorizationUseCase', () => {
  let useCase: AuthorizationUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    const permissionQuery = new PermissionQueryImpl(mockDb)

    useCase = new AuthorizationUseCase(permissionQuery)
  })

  describe('hasEndpointPermission', () => {
    describe('権限チェックのケース', () => {
      const testCases = [
        {
          name: '単一の権限が必要で、ユーザーが持っている場合trueを返す',
          endpointPath: '/api/articles',
          method: 'GET',
          requiredPermissionIds: [1],
          userPermissionIds: [1],
          expected: true,
        },
        {
          name: '単一の権限が必要で、ユーザーが持っていない場合falseを返す',
          endpointPath: '/api/admin/users',
          method: 'GET',
          requiredPermissionIds: [2],
          userPermissionIds: [],
          expected: false,
        },
        {
          name: '単一の権限が必要で、ユーザーが別の権限を持っている場合falseを返す',
          endpointPath: '/api/admin/users',
          method: 'POST',
          requiredPermissionIds: [2],
          userPermissionIds: [3],
          expected: false,
        },
        {
          name: '複数の権限が必要で、一部の権限しか持っていない場合falseを返す',
          endpointPath: '/api/roles',
          method: 'POST',
          requiredPermissionIds: [4, 5],
          userPermissionIds: [4],
          expected: false,
        },
        {
          name: '複数の権限が必要で、全ての権限を持っている場合trueを返す',
          endpointPath: '/api/roles',
          method: 'POST',
          requiredPermissionIds: [4, 5],
          userPermissionIds: [4, 5],
          expected: true,
        },
      ]

      testCases.forEach(
        ({ name, endpointPath, method, requiredPermissionIds, userPermissionIds, expected }) => {
          it(name, async () => {
            // エンドポイントに必要な権限をモック
            const mockEndpoint = {
              endpointId: 1,
              path: endpointPath,
              method,
              createdAt: new Date(),
              endpointPermissions: requiredPermissionIds.map((permissionId) => ({
                endpointId: 1,
                permissionId,
                permission: {
                  permissionId,
                  resource: 'test',
                  action: 'test',
                },
              })),
            }
            mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)

            if (userPermissionIds.length > 0) {
              // ユーザーのロールをモック
              mockDb.userRole.findMany.mockResolvedValue([
                {
                  activeUserId: BigInt(1),
                  roleId: 1,
                  grantedAt: new Date(),
                },
              ])

              // ユーザーの権限をモック
              const mockRolePermissionWithPermission: Prisma.RolePermissionGetPayload<{
                include: { permission: true }
              }>[] = userPermissionIds.map((permissionId) => ({
                roleId: 1,
                permissionId,
                permission: {
                  permissionId,
                  resource: 'test',
                  action: 'test',
                },
              }))
              mockDb.rolePermission.findMany.mockResolvedValue(mockRolePermissionWithPermission)
            } else {
              // ユーザーは権限を持っていない
              mockDb.userRole.findMany.mockResolvedValue([])
            }

            const result = await useCase.hasEndpointPermission(BigInt(1), endpointPath, method)

            expect(isSuccess(result)).toBe(true)
            if (isSuccess(result)) {
              expect(result.data).toBe(expected)
            }
          })
        },
      )
    })

    it('エンドポイントが登録されていない場合falseを返す', async () => {
      mockDb.endpoint.findUnique.mockResolvedValue(null)
      mockDb.endpoint.findMany.mockResolvedValue([])

      const result = await useCase.hasEndpointPermission(BigInt(1), '/api/unknown', 'GET')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBe(false)
      }
    })

    it('エンドポイントに権限が設定されていない場合falseを返す（エンドポイントが見つからない）', async () => {
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/public',
        method: 'GET',
        createdAt: new Date(),
        endpointPermissions: [],
      }
      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)

      const result = await useCase.hasEndpointPermission(BigInt(1), '/api/public', 'GET')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBe(false)
      }
    })

    it('ユーザーが複数のロールを持つ場合、全てのロールの権限を考慮する', async () => {
      const mockEndpoint = {
        endpointId: 1,
        path: '/api/admin',
        method: 'GET',
        createdAt: new Date(),
        endpointPermissions: [
          {
            endpointId: 1,
            permissionId: 1,
            permission: { permissionId: 1, resource: 'admin', action: 'read' },
          },
        ],
      }
      mockDb.endpoint.findUnique.mockResolvedValue(mockEndpoint)

      // ユーザーは2つのロールを持つ
      mockDb.userRole.findMany.mockResolvedValue([
        { activeUserId: BigInt(1), roleId: 1, grantedAt: new Date() },
        { activeUserId: BigInt(1), roleId: 2, grantedAt: new Date() },
      ])

      // ロール2が必要な権限を持つ
      const mockRolePermissions: Prisma.RolePermissionGetPayload<{
        include: { permission: true }
      }>[] = [
        {
          roleId: 2,
          permissionId: 1,
          permission: { permissionId: 1, resource: 'admin', action: 'read' },
        },
      ]
      mockDb.rolePermission.findMany.mockResolvedValue(mockRolePermissions)

      const result = await useCase.hasEndpointPermission(BigInt(1), '/api/admin', 'GET')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBe(true)
      }
    })
  })
})
