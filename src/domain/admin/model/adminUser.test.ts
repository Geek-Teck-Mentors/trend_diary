import { describe, expect, it } from 'vitest'
import AdminUser from './adminUser'

describe('AdminUser', () => {
  describe('正常系', () => {
    it('AdminUserエンティティを正しく生成できる', () => {
      const adminUser = new AdminUser(
        1, // adminUserId
        BigInt(100), // activeUserId
        new Date('2024-01-01'), // grantedAt
        1, // grantedByAdminUserId
      )

      expect(adminUser.adminUserId).toBe(1)
      expect(adminUser.activeUserId).toBe(BigInt(100))
      expect(adminUser.grantedAt).toEqual(new Date('2024-01-01'))
      expect(adminUser.grantedByAdminUserId).toBe(1)
    })

    it('デフォルト値でAdminUserエンティティを生成できる', () => {
      const now = new Date()
      const adminUser = new AdminUser(1, BigInt(100), now, 1)

      expect(adminUser.adminUserId).toBe(1)
      expect(adminUser.activeUserId).toBe(BigInt(100))
      expect(adminUser.grantedAt).toEqual(now)
      expect(adminUser.grantedByAdminUserId).toBe(1)
    })
  })

  describe('準正常系', () => {
    it('grantedAtが未来の日付でも正常に生成できる', () => {
      const futureDate = new Date('2025-12-31')
      const adminUser = new AdminUser(1, BigInt(100), futureDate, 1)

      expect(adminUser.grantedAt).toEqual(futureDate)
    })
  })

  describe('異常系', () => {
    it('adminUserIdが0以下の場合はエラー', () => {
      expect(() => {
        new AdminUser(0, BigInt(100), new Date(), 1)
      }).toThrow('adminUserIdは正の整数である必要があります')
    })

    it('activeUserIdが0以下の場合はエラー', () => {
      expect(() => {
        new AdminUser(1, BigInt(0), new Date(), 1)
      }).toThrow('activeUserIdは正の整数である必要があります')
    })

    it('grantedByAdminUserIdが0以下の場合はエラー', () => {
      expect(() => {
        new AdminUser(1, BigInt(100), new Date(), 0)
      }).toThrow('grantedByAdminUserIdは正の整数である必要があります')
    })
  })
})
