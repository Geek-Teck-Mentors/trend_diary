import { describe, expect, it } from 'vitest'
import { toUserListItem, UserWithRolesRow } from './mapper'

describe('Admin Mapper', () => {
  describe('toUserListItem', () => {
    // テストデータ作成ヘルパー
    const createMockUserWithRolesRow = (
      overrides: Partial<UserWithRolesRow> = {},
    ): UserWithRolesRow => {
      const now = new Date('2024-01-15T09:30:15.123Z')

      return {
        activeUserId: 123456789n,
        email: 'test@example.com',
        displayName: 'テストユーザー',
        authenticationId: null,
        createdAt: now,
        hasAdminAccess: false,
        adminGrantedAt: null,
        adminGrantedByUserId: null,
        ...overrides,
      }
    }

    describe('基本動作', () => {
      it('Admin権限を持つユーザーデータで全フィールドが正確にマッピングされること', () => {
        // Arrange
        const grantedAt = new Date('2024-01-10T10:00:00.000Z')
        const userWithRolesRow = createMockUserWithRolesRow({
          hasAdminAccess: true,
          adminGrantedAt: grantedAt,
          adminGrantedByUserId: 2n,
        })

        // Act
        const result = toUserListItem(userWithRolesRow)

        // Assert
        expect(result.activeUserId).toBe(userWithRolesRow.activeUserId)
        expect(result.email).toBe(userWithRolesRow.email)
        expect(result.displayName).toBe(userWithRolesRow.displayName)
        expect(result.hasAdminAccess).toBe(true)
        expect(result.grantedAt).toEqual(grantedAt)
        expect(result.grantedByAdminUserId).toBe(2)
        expect(result.createdAt).toEqual(userWithRolesRow.createdAt)
      })

      it('privacy_policy権限を持つユーザーもAdmin判定されること', () => {
        // Arrange
        const userWithRolesRow = createMockUserWithRolesRow({
          hasAdminAccess: true,
          adminGrantedAt: new Date(),
          adminGrantedByUserId: null,
        })

        // Act
        const result = toUserListItem(userWithRolesRow)

        // Assert
        expect(result.hasAdminAccess).toBe(true)
      })

      it('Admin権限を持たないユーザーデータで正確にマッピングされること', () => {
        // Arrange
        const userWithRolesRow = createMockUserWithRolesRow({
          hasAdminAccess: false,
          adminGrantedAt: null,
          adminGrantedByUserId: null,
        })

        // Act
        const result = toUserListItem(userWithRolesRow)

        // Assert
        expect(result.activeUserId).toBe(userWithRolesRow.activeUserId)
        expect(result.email).toBe(userWithRolesRow.email)
        expect(result.displayName).toBe(userWithRolesRow.displayName)
        expect(result.hasAdminAccess).toBe(false)
        expect(result.grantedAt).toBeNull()
        expect(result.grantedByAdminUserId).toBeNull()
        expect(result.createdAt).toEqual(userWithRolesRow.createdAt)
      })

      it('displayNameがnullのユーザーでも正常に処理されること', () => {
        // Arrange
        const userWithRolesRow = createMockUserWithRolesRow({
          displayName: null,
          hasAdminAccess: false,
        })

        // Act
        const result = toUserListItem(userWithRolesRow)

        // Assert
        expect(result.displayName).toBeNull()
        expect(result.hasAdminAccess).toBe(false)
      })

      it('grantedByActiveUserIdがnullの場合も正常に処理されること', () => {
        // Arrange
        const userWithRolesRow = createMockUserWithRolesRow({
          hasAdminAccess: true,
          adminGrantedAt: new Date(),
          adminGrantedByUserId: null,
        })

        // Act
        const result = toUserListItem(userWithRolesRow)

        // Assert
        expect(result.hasAdminAccess).toBe(true)
        expect(result.grantedByAdminUserId).toBeNull()
      })
    })
  })
})
