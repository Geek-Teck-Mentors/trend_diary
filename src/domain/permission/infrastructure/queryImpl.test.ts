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

  describe('getUserRoles', () => {
    it('ユーザーのロール一覧を取得できる', async () => {
      const mockUserRoleWithRole: Prisma.UserRoleGetPayload<{ include: { role: true } }>[] = [
        {
          activeUserId: BigInt(1),
          roleId: 1,
          grantedAt: new Date(),
          role: {
            roleId: 1,
            displayName: '管理者',
            description: 'テスト',
            createdAt: new Date(),
          },
        },
      ]
      mockDb.userRole.findMany.mockResolvedValue(mockUserRoleWithRole)

      const result = await query.getUserRoles(BigInt(1))

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].displayName).toBe('管理者')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.userRole.findMany.mockRejectedValue(new Error('DB Error'))

      const result = await query.getUserRoles(BigInt(1))

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
      }
    })
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

  describe('getRoleByName', () => {
    it('ロール名でロールを取得できる', async () => {
      mockDb.role.findFirst.mockResolvedValue({
        roleId: 1,
        displayName: '管理者',
        description: 'テスト',
        createdAt: new Date(),
      })

      const result = await query.getRoleByName('管理者')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data?.displayName).toBe('管理者')
      }
    })

    it('ロールが存在しない場合nullを返す', async () => {
      mockDb.role.findFirst.mockResolvedValue(null)

      const result = await query.getRoleByName('存在しないロール')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeNull()
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.role.findFirst.mockRejectedValue(new Error('DB Error'))

      const result = await query.getRoleByName('管理者')

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
      }
    })
  })

  describe('getPermissionByResourceAction', () => {
    it('リソースとアクションでパーミッションを取得できる', async () => {
      mockDb.permission.findUnique.mockResolvedValue({
        permissionId: 1,
        resource: 'article',
        action: 'read',
      })

      const result = await query.getPermissionByResourceAction('article', 'read')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data?.resource).toBe('article')
        expect(result.data?.action).toBe('read')
      }
    })

    it('パーミッションが存在しない場合nullを返す', async () => {
      mockDb.permission.findUnique.mockResolvedValue(null)

      const result = await query.getPermissionByResourceAction('article', 'delete')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeNull()
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.permission.findUnique.mockRejectedValue(new Error('DB Error'))

      const result = await query.getPermissionByResourceAction('article', 'read')

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
      }
    })
  })

  describe('getUserRoleByUserAndRole', () => {
    it('ユーザーロールを取得できる', async () => {
      mockDb.userRole.findUnique.mockResolvedValue({
        activeUserId: BigInt(1),
        roleId: 1,
        grantedAt: new Date(),
      })

      const result = await query.getUserRoleByUserAndRole(BigInt(1), 1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data?.activeUserId).toBe(BigInt(1))
        expect(result.data?.roleId).toBe(1)
      }
    })

    it('ユーザーロールが存在しない場合nullを返す', async () => {
      mockDb.userRole.findUnique.mockResolvedValue(null)

      const result = await query.getUserRoleByUserAndRole(BigInt(1), 1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeNull()
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.userRole.findUnique.mockRejectedValue(new Error('DB Error'))

      const result = await query.getUserRoleByUserAndRole(BigInt(1), 1)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
      }
    })
  })
})
