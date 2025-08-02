import { describe, expect, it } from 'vitest'
import User from './user'

describe('User ドメインモデル', () => {
  describe('正常系', () => {
    it('必須プロパティでUserを作成できる', () => {
      const now = new Date()
      const user = new User(1n, now)

      expect(user.userId).toBe(1n)
      expect(user.createdAt).toEqual(now)
    })

    it('デフォルトのcreatedAtでUserを作成できる', () => {
      const user = new User(1n)

      expect(user.userId).toBe(1n)
      expect(user.createdAt).toBeInstanceOf(Date)
    })
  })

  describe('準正常系', () => {
    it('非常に大きなIDでも正常に動作する', () => {
      const largeId = BigInt('9223372036854775807') // max bigint
      const user = new User(largeId)

      expect(user.userId).toBe(largeId)
    })
  })

  describe('異常系', () => {
    it('無効なIDでは作成に失敗する', () => {
      // このテストは現在失敗する（実装がないため）
      expect(() => {
        new User(0n) // 無効なID
      }).toThrow('User ID must be positive')
    })

    it('負のIDでは作成に失敗する', () => {
      // このテストは現在失敗する（実装がないため）
      expect(() => {
        new User(-1n) // 負のID
      }).toThrow('User ID must be positive')
    })
  })
})
