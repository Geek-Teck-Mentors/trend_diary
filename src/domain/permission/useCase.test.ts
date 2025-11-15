import type { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { PermissionCommandImpl } from './infrastructure/commandImpl'
import { PermissionQueryImpl } from './infrastructure/queryImpl'
import { UseCase } from './useCase'

const mockDb = mockDeep<PrismaClient>()

describe('Permission UseCase', () => {
  let useCase: UseCase

  beforeEach(() => {
    vi.clearAllMocks()
    const command = new PermissionCommandImpl(mockDb)
    const query = new PermissionQueryImpl(mockDb)
    useCase = new UseCase(query, command)
  })

  describe('hasPermission', () => {
    it('ユーザーが権限を持っている場合trueを返す', async () => {
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

      const result = await useCase.hasPermission(BigInt(1), 'article', 'read')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBe(true)
      }
    })

    it('ユーザーが権限を持っていない場合falseを返す', async () => {
      mockDb.userRole.findMany.mockResolvedValue([])

      const result = await useCase.hasPermission(BigInt(1), 'article', 'write')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBe(false)
      }
    })
  })

  describe('hasRole', () => {
    it('ユーザーがロールを持っている場合trueを返す', async () => {
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

      const result = await useCase.hasRole(BigInt(1), '管理者')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBe(true)
      }
    })

    it('ユーザーがロールを持っていない場合falseを返す', async () => {
      mockDb.userRole.findMany.mockResolvedValue([])

      const result = await useCase.hasRole(BigInt(1), '管理者')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBe(false)
      }
    })
  })

  describe('assignRole', () => {
    it('ロールを正常に付与できる', async () => {
      mockDb.userRole.findUnique.mockResolvedValue(null)
      mockDb.activeUser.findUnique.mockResolvedValue({
        activeUserId: BigInt(1),
        email: 'test@example.com',
        password: 'hashed',
        displayName: 'Test User',
        authenticationId: null,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: BigInt(1),
      })
      mockDb.role.findUnique.mockResolvedValue({
        roleId: 1,
        displayName: '管理者',
        description: 'テスト',
        createdAt: new Date(),
      })
      mockDb.userRole.create.mockResolvedValue({
        activeUserId: BigInt(1),
        roleId: 1,
        grantedAt: new Date(),
      })

      const result = await useCase.assignRole({
        activeUserId: BigInt(1),
        roleId: 1,
      })

      expect(isSuccess(result)).toBe(true)
    })

    it('すでにロールを持っている場合エラーを返す', async () => {
      mockDb.userRole.findUnique.mockResolvedValue({
        activeUserId: BigInt(1),
        roleId: 1,
        grantedAt: new Date(),
      })

      const result = await useCase.assignRole({
        activeUserId: BigInt(1),
        roleId: 1,
      })

      expect(isFailure(result)).toBe(true)
    })
  })

  describe('revokeRole', () => {
    it('ロールを正常に剥奪できる', async () => {
      mockDb.userRole.findUnique.mockResolvedValue({
        activeUserId: BigInt(1),
        roleId: 1,
        grantedAt: new Date(),
      })
      mockDb.userRole.delete.mockResolvedValue({
        activeUserId: BigInt(1),
        roleId: 1,
        grantedAt: new Date(),
      })

      const result = await useCase.revokeRole({
        activeUserId: BigInt(1),
        roleId: 1,
      })

      expect(isSuccess(result)).toBe(true)
    })

    it('ロールを持っていない場合エラーを返す', async () => {
      mockDb.userRole.findUnique.mockResolvedValue(null)

      const result = await useCase.revokeRole({
        activeUserId: BigInt(1),
        roleId: 1,
      })

      expect(isFailure(result)).toBe(true)
    })
  })
})
