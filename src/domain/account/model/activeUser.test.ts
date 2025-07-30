import { describe, expect, it } from 'vitest'
import ActiveUser from './activeUser'

describe('ActiveUser ドメインモデル', () => {
  describe('正常系', () => {
    it('必須プロパティでActiveUserを作成できる', () => {
      const now = new Date()
      const activeUser = new ActiveUser(
        1n,
        2n,
        'test@example.com',
        'hashedPassword123',
        'テストユーザー',
        now,
        now,
        now
      )

      expect(activeUser.activeUserId).toBe(1n)
      expect(activeUser.userId).toBe(2n)
      expect(activeUser.email).toBe('test@example.com')
      expect(activeUser.password).toBe('hashedPassword123')
      expect(activeUser.displayName).toBe('テストユーザー')
      expect(activeUser.lastLogin).toEqual(now)
      expect(activeUser.createdAt).toEqual(now)
      expect(activeUser.updatedAt).toEqual(now)
    })

    it('オプションプロパティなしでActiveUserを作成できる', () => {
      const now = new Date()
      const activeUser = new ActiveUser(
        1n,
        2n,
        'test@example.com',
        'hashedPassword123',
        undefined,
        now,
        now,
        now
      )

      expect(activeUser.displayName).toBeUndefined()
      expect(activeUser.lastLogin).toEqual(now)
    })

    it('ログイン記録を更新できる', async () => {
      const now = new Date()
      const activeUser = new ActiveUser(
        1n,
        2n,
        'test@example.com',
        'hashedPassword123',
        'テストユーザー',
        now,
        now,
        now
      )

      const beforeLogin = Date.now()
      // 少し待ってから実行
      await new Promise(resolve => setTimeout(resolve, 2))
      activeUser.recordLogin()
      
      expect(activeUser.lastLogin?.getTime()).toBeGreaterThan(beforeLogin)
      expect(activeUser.lastLogin).toBeInstanceOf(Date)
    })
  })

  describe('準正常系', () => {
    it('displayNameがnullでも正常に動作する', () => {
      const now = new Date()
      const activeUser = new ActiveUser(
        1n,
        2n,
        'test@example.com',
        'hashedPassword123',
        null,
        now,
        now,
        now
      )

      expect(activeUser.displayName).toBeNull()
    })
  })

  describe('異常系', () => {
    it('無効なIDでは作成に失敗する', () => {
      // このテストは現在失敗する（実装がないため）
      expect(() => {
        new ActiveUser(
          0n, // 無効なID
          2n,
          'test@example.com',
          'hashedPassword123',
          'テストユーザー',
          new Date(),
          new Date(),
          new Date()
        )
      }).toThrow('ActiveUser ID must be positive')
    })

    it('空のメールアドレスでは作成に失敗する', () => {
      // このテストは現在失敗する（実装がないため）
      expect(() => {
        new ActiveUser(
          1n,
          2n,
          '', // 空のメール
          'hashedPassword123',
          'テストユーザー',
          new Date(),
          new Date(),
          new Date()
        )
      }).toThrow('Email cannot be empty')
    })
  })
})