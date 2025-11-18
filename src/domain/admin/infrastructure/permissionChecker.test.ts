import { describe, expect, it } from 'vitest'
import { findAdminRole } from './permissionChecker'

type UserRole = {
  roleId: number
  role: { displayName: string }
  grantedAt: Date
  grantedByActiveUserId: bigint
}

describe('permissionChecker', () => {
  describe('findAdminRole', () => {
    it.each<{
      description: string
      userRoles: UserRole[]
      expectedDefined: boolean
      expectedDisplayName?: string
    }>([
      {
        description: '管理者ロールを持つユーザーロールを見つける',
        userRoles: [
          {
            roleId: 1,
            role: { displayName: '一般ユーザー' },
            grantedAt: new Date(),
            grantedByActiveUserId: 1n,
          },
          {
            roleId: 2,
            role: { displayName: '管理者' },
            grantedAt: new Date(),
            grantedByActiveUserId: 1n,
          },
        ],
        expectedDefined: true,
        expectedDisplayName: '管理者',
      },
      {
        description: 'スーパー管理者ロールを持つユーザーロールを見つける',
        userRoles: [
          {
            roleId: 1,
            role: { displayName: 'スーパー管理者' },
            grantedAt: new Date(),
            grantedByActiveUserId: 1n,
          },
        ],
        expectedDefined: true,
        expectedDisplayName: 'スーパー管理者',
      },
      {
        description: '管理者ロールが存在しない場合はundefinedを返す',
        userRoles: [
          {
            roleId: 1,
            role: { displayName: '一般ユーザー' },
            grantedAt: new Date(),
            grantedByActiveUserId: 1n,
          },
        ],
        expectedDefined: false,
      },
      {
        description: '空の配列の場合はundefinedを返す',
        userRoles: [],
        expectedDefined: false,
      },
      {
        description: '複数の管理者ロールがある場合は最初のものを返す',
        userRoles: [
          {
            roleId: 1,
            role: { displayName: '管理者' },
            grantedAt: new Date('2024-01-01'),
            grantedByActiveUserId: 1n,
          },
          {
            roleId: 2,
            role: { displayName: 'スーパー管理者' },
            grantedAt: new Date('2024-01-02'),
            grantedByActiveUserId: 1n,
          },
        ],
        expectedDefined: true,
        expectedDisplayName: '管理者',
      },
    ])('$description', ({ userRoles, expectedDefined, expectedDisplayName }) => {
      const result = findAdminRole(userRoles)

      if (expectedDefined) {
        expect(result).toBeDefined()
        expect(result?.role.displayName).toBe(expectedDisplayName)
      } else {
        expect(result).toBeUndefined()
      }
    })
  })
})
