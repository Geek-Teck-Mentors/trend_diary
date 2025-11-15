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
})
