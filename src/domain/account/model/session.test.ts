import { describe, expect, it } from 'vitest'
import Session from './session'

describe('Session ドメインモデル', () => {
  describe('正常系', () => {
    it('必須プロパティでSessionを作成できる', () => {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24時間後
      
      const session = new Session(
        'session-123',
        1n,
        'token-456',
        expiresAt,
        '192.168.1.1',
        'Mozilla/5.0',
        now
      )

      expect(session.sessionId).toBe('session-123')
      expect(session.activeUserId).toBe(1n)
      expect(session.sessionToken).toBe('token-456')
      expect(session.expiresAt).toEqual(expiresAt)
      expect(session.ipAddress).toBe('192.168.1.1')
      expect(session.userAgent).toBe('Mozilla/5.0')
      expect(session.createdAt).toEqual(now)
    })

    it('オプションプロパティなしでSessionを作成できる', () => {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      
      const session = new Session(
        'session-123',
        1n,
        undefined,
        expiresAt,
        undefined,
        undefined,
        now
      )

      expect(session.sessionToken).toBeUndefined()
      expect(session.ipAddress).toBeUndefined()
      expect(session.userAgent).toBeUndefined()
    })

    it('セッションの有効性を確認できる', () => {
      const now = new Date()
      const futureExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      
      const session = new Session(
        'session-123',
        1n,
        'token-456',
        futureExpiry,
        '192.168.1.1',
        'Mozilla/5.0',
        now
      )

      expect(session.isValid()).toBe(true)
    })

    it('期限切れセッションを識別できる', () => {
      const now = new Date()
      const pastExpiry = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24時間前
      
      const session = new Session(
        'session-123',
        1n,
        'token-456',
        pastExpiry,
        '192.168.1.1',
        'Mozilla/5.0',
        now,
        true // forceExpiredフラグでテスト用に許可
      )

      expect(session.isValid()).toBe(false)
    })

    it('セッションを無効化できる', () => {
      const now = new Date()
      const futureExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      
      const session = new Session(
        'session-123',
        1n,
        'token-456',
        futureExpiry,
        '192.168.1.1',
        'Mozilla/5.0',
        now
      )

      session.invalidate()
      expect(session.isValid()).toBe(false)
    })
  })

  describe('準正常系', () => {
    it('IPv6アドレスでも正常に動作する', () => {
      const session = new Session(
        'session-123',
        1n,
        'token-456',
        new Date(Date.now() + 24 * 60 * 60 * 1000),
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        'Mozilla/5.0',
        new Date()
      )

      expect(session.ipAddress).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
    })
  })

  describe('異常系', () => {
    it('空のセッションIDでは作成に失敗する', () => {
      // このテストは現在失敗する（実装がないため）
      expect(() => {
        new Session(
          '', // 空のセッションID
          1n,
          'token-456',
          new Date(Date.now() + 24 * 60 * 60 * 1000),
          '192.168.1.1',
          'Mozilla/5.0',
          new Date()
        )
      }).toThrow('Session ID cannot be empty')
    })

    it('無効なactiveUserIdでは作成に失敗する', () => {
      // このテストは現在失敗する（実装がないため）
      expect(() => {
        new Session(
          'session-123',
          0n, // 無効なactiveUserId
          'token-456',
          new Date(Date.now() + 24 * 60 * 60 * 1000),
          '192.168.1.1',
          'Mozilla/5.0',
          new Date()
        )
      }).toThrow('ActiveUser ID must be positive')
    })

    it('過去の有効期限では作成に失敗する', () => {
      // このテストは現在失敗する（実装がないため）
      expect(() => {
        new Session(
          'session-123',
          1n,
          'token-456',
          new Date(Date.now() - 24 * 60 * 60 * 1000), // 過去の日時
          '192.168.1.1',
          'Mozilla/5.0',
          new Date()
        )
      }).toThrow('Session expiry must be in the future')
    })
  })
})