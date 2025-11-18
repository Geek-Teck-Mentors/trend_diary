import { describe, expect, it } from 'vitest'
import { ADMIN_ROLE_NAMES, findAdminRole } from './permissionChecker'

describe('permissionChecker', () => {
  describe('ADMIN_ROLE_NAMES', () => {
    it('管理者ロール名の配列が定義されている', () => {
      expect(ADMIN_ROLE_NAMES).toEqual(['管理者', 'スーパー管理者'])
    })
  })

  describe('findAdminRole', () => {
    it('管理者ロールを持つユーザーロールを見つける', () => {
      const userRoles = [
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
      ]

      const result = findAdminRole(userRoles)

      expect(result).toBeDefined()
      expect(result?.role.displayName).toBe('管理者')
    })

    it('スーパー管理者ロールを持つユーザーロールを見つける', () => {
      const userRoles = [
        {
          roleId: 1,
          role: { displayName: 'スーパー管理者' },
          grantedAt: new Date(),
          grantedByActiveUserId: 1n,
        },
      ]

      const result = findAdminRole(userRoles)

      expect(result).toBeDefined()
      expect(result?.role.displayName).toBe('スーパー管理者')
    })

    it('管理者ロールが存在しない場合はundefinedを返す', () => {
      const userRoles = [
        {
          roleId: 1,
          role: { displayName: '一般ユーザー' },
          grantedAt: new Date(),
          grantedByActiveUserId: 1n,
        },
      ]

      const result = findAdminRole(userRoles)

      expect(result).toBeUndefined()
    })

    it('空の配列の場合はundefinedを返す', () => {
      const userRoles: Array<{ role: { displayName: string } }> = []

      const result = findAdminRole(userRoles)

      expect(result).toBeUndefined()
    })

    it('複数の管理者ロールがある場合は最初のものを返す', () => {
      const userRoles = [
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
      ]

      const result = findAdminRole(userRoles)

      expect(result).toBeDefined()
      expect(result?.role.displayName).toBe('管理者')
    })
  })
})
