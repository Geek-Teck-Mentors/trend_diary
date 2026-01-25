import { ActiveUser as RdbActiveUser } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import { mapToActiveUser } from './mapper'

describe('mapToActiveUser', () => {
  const createMockRdbActiveUser = (overrides: Partial<RdbActiveUser> = {}): RdbActiveUser => {
    const now = new Date('2024-01-15T09:30:00Z')

    return {
      activeUserId: 12345n,
      userId: 67890n,
      email: 'john.doe@example.com',
      displayName: '田中太郎',
      authenticationId: null,
      createdAt: new Date('2023-11-20T10:15:30Z'),
      updatedAt: now,
      ...overrides,
    }
  }

  describe('基本動作', () => {
    it('標準的なActiveUserデータで全フィールドが正確にマッピングされること', () => {
      const rdbActiveUser = createMockRdbActiveUser()

      const result = mapToActiveUser(rdbActiveUser)

      expect(result).toBeDefined()
      expect(result.activeUserId).toBe(rdbActiveUser.activeUserId)
      expect(result.userId).toBe(rdbActiveUser.userId)
      expect(result.email).toBe(rdbActiveUser.email)
      expect(result.displayName).toBe(rdbActiveUser.displayName)
      expect(result.createdAt).toEqual(rdbActiveUser.createdAt)
      expect(result.updatedAt).toEqual(rdbActiveUser.updatedAt)
    })

    it('displayNameがnullでも正常にマッピングされること', () => {
      const rdbActiveUser = createMockRdbActiveUser({
        displayName: null,
      })

      const result = mapToActiveUser(rdbActiveUser)

      expect(result).toBeDefined()
      expect(result.displayName).toBeNull()
    })

    it('authenticationIdがnullの場合undefinedに変換されること', () => {
      const rdbActiveUser = createMockRdbActiveUser({
        authenticationId: null,
      })

      const result = mapToActiveUser(rdbActiveUser)

      expect(result.authenticationId).toBeUndefined()
    })

    it('authenticationIdが存在する場合そのまま返されること', () => {
      const rdbActiveUser = createMockRdbActiveUser({
        authenticationId: 'auth-id-123',
      })

      const result = mapToActiveUser(rdbActiveUser)

      expect(result.authenticationId).toBe('auth-id-123')
    })
  })
})
