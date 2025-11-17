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
    describe('完全一致のケース', () => {
      const testCases = [
        {
          name: '単一の権限が必要なエンドポイント',
          endpointPath: '/api/admin/users',
          method: 'GET',
          mockEndpoint: {
            endpointId: 1,
            path: '/api/admin/users',
            method: 'GET',
            createdAt: new Date(),
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
          },
          expectedPermissions: [{ resource: 'user', action: 'list' }],
        },
        {
          name: '複数のパーミッションが必要なエンドポイント',
          endpointPath: '/api/roles',
          method: 'POST',
          mockEndpoint: {
            endpointId: 5,
            path: '/api/roles',
            method: 'POST',
            createdAt: new Date(),
            endpointPermissions: [
              {
                endpointId: 5,
                permissionId: 4,
                permission: {
                  permissionId: 4,
                  resource: 'role',
                  action: 'create',
                },
              },
              {
                endpointId: 5,
                permissionId: 5,
                permission: {
                  permissionId: 5,
                  resource: 'role',
                  action: 'assign',
                },
              },
            ],
          },
          expectedPermissions: [
            { resource: 'role', action: 'create' },
            { resource: 'role', action: 'assign' },
          ],
        },
        {
          name: 'パーミッションが未設定のエンドポイント',
          endpointPath: '/api/public/info',
          method: 'GET',
          mockEndpoint: {
            endpointId: 7,
            path: '/api/public/info',
            method: 'GET',
            createdAt: new Date(),
            endpointPermissions: [],
          },
          expectedPermissions: [],
        },
      ]

      testCases.forEach(({ name, endpointPath, method, mockEndpoint, expectedPermissions }) => {
        it(name, async () => {
          mockDb.endpoint.findUnique.mockResolvedValue(
            mockEndpoint as Prisma.EndpointGetPayload<{
              include: { endpointPermissions: { include: { permission: true } } }
            }>,
          )

          const result = await query.getRequiredPermissionsByEndpoint(endpointPath, method)

          expect(isSuccess(result)).toBe(true)
          if (isSuccess(result)) {
            expect(result.data).toHaveLength(expectedPermissions.length)
            expectedPermissions.forEach((expected, index) => {
              expect(result.data[index].resource).toBe(expected.resource)
              expect(result.data[index].action).toBe(expected.action)
            })
          }
        })
      })
    })

    describe('パスパラメータマッチングのケース', () => {
      const testCases = [
        {
          name: 'パス末尾のパラメータ（:id）',
          requestPath: '/api/admin/users/123',
          method: 'POST',
          patternPath: '/api/admin/users/:id',
          expectedPermissions: [{ resource: 'user', action: 'grant_admin' }],
          permissionId: 2,
        },
        {
          name: 'パス末尾のパラメータ（:version）',
          requestPath: '/api/policies/1.0.0',
          method: 'GET',
          patternPath: '/api/policies/:version',
          expectedPermissions: [{ resource: 'privacy_policy', action: 'read' }],
          permissionId: 3,
        },
        {
          name: 'パスの途中にパラメータ',
          requestPath: '/api/users/42/profile',
          method: 'GET',
          patternPath: '/api/users/:id/profile',
          expectedPermissions: [{ resource: 'user', action: 'read' }],
          permissionId: 2,
        },
        {
          name: '複数のパスパラメータ',
          requestPath: '/api/users/100/articles/200',
          method: 'DELETE',
          patternPath: '/api/users/:userId/articles/:articleId',
          expectedPermissions: [{ resource: 'article', action: 'delete' }],
          permissionId: 1,
        },
      ]

      testCases.forEach(
        ({ name, requestPath, method, patternPath, expectedPermissions, permissionId }) => {
          it(name, async () => {
            mockDb.endpoint.findUnique.mockResolvedValue(null)

            const mockEndpoints: Prisma.EndpointGetPayload<{
              include: { endpointPermissions: { include: { permission: true } } }
            }>[] = [
              {
                endpointId: permissionId,
                path: patternPath,
                method,
                createdAt: new Date(),
                endpointPermissions: [
                  {
                    endpointId: permissionId,
                    permissionId,
                    permission: {
                      permissionId,
                      resource: expectedPermissions[0].resource,
                      action: expectedPermissions[0].action,
                    },
                  },
                ],
              },
            ]
            mockDb.endpoint.findMany.mockResolvedValue(mockEndpoints)

            const result = await query.getRequiredPermissionsByEndpoint(requestPath, method)

            expect(isSuccess(result)).toBe(true)
            if (isSuccess(result)) {
              expect(result.data).toHaveLength(expectedPermissions.length)
              expectedPermissions.forEach((expected, index) => {
                expect(result.data[index].resource).toBe(expected.resource)
                expect(result.data[index].action).toBe(expected.action)
              })
            }
          })
        },
      )
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

    it('パターンマッチングで最初にマッチしたエンドポイントを返す', async () => {
      mockDb.endpoint.findUnique.mockResolvedValue(null)

      const mockEndpoints: Prisma.EndpointGetPayload<{
        include: { endpointPermissions: { include: { permission: true } } }
      }>[] = [
        {
          endpointId: 9,
          path: '/api/items/:id',
          method: 'GET',
          createdAt: new Date(),
          endpointPermissions: [
            {
              endpointId: 9,
              permissionId: 1,
              permission: {
                permissionId: 1,
                resource: 'item',
                action: 'read',
              },
            },
          ],
        },
        {
          endpointId: 10,
          path: '/api/items/:itemId',
          method: 'GET',
          createdAt: new Date(),
          endpointPermissions: [
            {
              endpointId: 10,
              permissionId: 2,
              permission: {
                permissionId: 2,
                resource: 'item',
                action: 'list',
              },
            },
          ],
        },
      ]
      mockDb.endpoint.findMany.mockResolvedValue(mockEndpoints)

      const result = await query.getRequiredPermissionsByEndpoint('/api/items/123', 'GET')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(1)
        // 最初にマッチしたエンドポイント（endpointId: 9）の権限が返される
        expect(result.data[0].resource).toBe('item')
        expect(result.data[0].action).toBe('read')
      }
    })
  })
})
