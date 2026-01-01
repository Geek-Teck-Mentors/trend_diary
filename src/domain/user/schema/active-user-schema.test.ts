import { describe, expect, it } from 'vitest'
import { activeUserInputSchema, activeUserSchema } from './active-user-schema'

describe('ActiveUserスキーマ', () => {
  describe('正常系', () => {
    it('有効なActiveUserデータを検証できる', () => {
      const validData = {
        activeUserId: 1n,
        userId: 2n,
        email: 'test@example.com',
        password: 'password123',
        displayName: 'テストユーザー',
        authenticationId: null,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = activeUserSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('有効なActiveUserInputを検証できる', () => {
      const validInput = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'テストユーザー',
      }

      const result = activeUserInputSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('displayNameがnullでも検証に成功する', () => {
      const validInput = {
        email: 'test@example.com',
        password: 'password123',
        displayName: null,
      }

      const result = activeUserInputSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })
  })

  describe('準正常系', () => {
    it('オプションフィールドなしでも検証に成功する', () => {
      const minimalData = {
        activeUserId: 1n,
        userId: 2n,
        email: 'test@example.com',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = activeUserSchema.safeParse(minimalData)
      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('無効なメールアドレスでは検証に失敗する', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      }

      const result = activeUserInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('短すぎるパスワードでは検証に失敗する', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '1234567', // 8文字未満
      }

      const result = activeUserInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('負のIDでは検証に失敗する', () => {
      const invalidData = {
        activeUserId: -1n,
        userId: 2n,
        email: 'test@example.com',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = activeUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('長すぎるdisplayNameでは検証に失敗する', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'a'.repeat(1025), // 1024文字を超える
      }

      const result = activeUserInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('長すぎるパスワードでは検証に失敗する', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'a'.repeat(51), // 50文字を超える
      }

      const result = activeUserInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
