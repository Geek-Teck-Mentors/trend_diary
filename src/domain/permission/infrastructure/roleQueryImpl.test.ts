import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { ServerError } from '@/common/errors'
import { RoleQueryImpl } from './roleQueryImpl'

const mockDb = mockDeep<PrismaClient>()

describe('RoleQueryImpl', () => {
  let query: RoleQueryImpl

  beforeEach(() => {
    vi.clearAllMocks()
    query = new RoleQueryImpl(mockDb)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('findAllRoles', () => {
    it('全てのロールを取得できる', async () => {
      const mockRoles = [
        {
          roleId: 1,
          preset: true,
          displayName: 'Admin',
          description: 'Administrator',
          createdAt: new Date(),
        },
        {
          roleId: 2,
          preset: false,
          displayName: 'Editor',
          description: 'Can edit articles',
          createdAt: new Date(),
        },
      ]

      mockDb.role.findMany.mockResolvedValue(mockRoles)

      const result = await query.findAllRoles()

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0].roleId).toBe(1)
        expect(result.data[0].displayName).toBe('Admin')
        expect(result.data[1].roleId).toBe(2)
        expect(result.data[1].displayName).toBe('Editor')
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.role.findMany.mockRejectedValue(new Error('DB Error'))

      const result = await query.findAllRoles()

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('ロール一覧の取得に失敗')
      }
    })
  })

  describe('findRoleById', () => {
    it('指定したIDのロールを取得できる', async () => {
      const mockRole = {
        roleId: 1,
        preset: true,
        displayName: 'Admin',
        description: 'Administrator',
        createdAt: new Date(),
      }

      mockDb.role.findUnique.mockResolvedValue(mockRole)

      const result = await query.findRoleById(1)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).not.toBeNull()
        expect(result.data?.roleId).toBe(1)
        expect(result.data?.displayName).toBe('Admin')
      }
    })

    it('ロールが存在しない場合nullを返す', async () => {
      mockDb.role.findUnique.mockResolvedValue(null)

      const result = await query.findRoleById(999)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeNull()
      }
    })

    it('DB接続エラーの場合ServerErrorを返す', async () => {
      mockDb.role.findUnique.mockRejectedValue(new Error('DB Error'))

      const result = await query.findRoleById(1)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('ロールの取得に失敗')
      }
    })
  })

  describe('findPermissionsByRoleId', () => {
    it('指定したロールIDのパーミッション一覧を取得できる', async () => {
      const mockRolePermissions: Array<{
        roleId: number
        permissionId: number
        permission: {
          permissionId: number
          resource: string
          action: string
        }
      }> = [
        {
          roleId: 1,
          permissionId: 1,
          permission: {
            permissionId: 1,
            resource: 'article',
            action: 'read',
          },
        },
        {
          roleId: 1,
          permissionId: 2,
          permission: {
            permissionId: 2,
            resource: 'article',
            action: 'write',
          },
        },
      ]

      mockDb.rolePermission.findMany.mockResolvedValue(mockRolePermissions)

      const result = await query.findPermissionsByRoleId(1)

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
      mockDb.rolePermission.findMany.mockRejectedValue(new Error('DB Error'))

      const result = await query.findPermissionsByRoleId(1)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('ロールのパーミッション取得に失敗')
      }
    })
  })
})
