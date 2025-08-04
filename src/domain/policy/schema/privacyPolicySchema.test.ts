import { describe, expect, it } from 'vitest'
import {
  type PrivacyPolicyActivate,
  type PrivacyPolicyClone,
  type PrivacyPolicyInput,
  type PrivacyPolicyUpdate,
  privacyPolicyActivateSchema,
  privacyPolicyCloneSchema,
  privacyPolicyInputSchema,
  privacyPolicySchema,
  privacyPolicyUpdateSchema,
} from './privacyPolicySchema'

describe('privacyPolicySchema', () => {
  describe('基本動作', () => {
    it('正常なプライバシーポリシーデータをバリデーションできる', () => {
      const validData = {
        version: 1,
        content: 'このプライバシーポリシーは...',
        effectiveAt: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      }

      const result = privacyPolicySchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('有効化されたプライバシーポリシーデータをバリデーションできる', () => {
      const validData = {
        version: 2,
        content: '更新されたプライバシーポリシーは...',
        effectiveAt: new Date('2024-01-15T00:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      }

      const result = privacyPolicySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('境界値・特殊値', () => {
    it('contentが空文字列でもバリデーションを通す', () => {
      const data = {
        version: 1,
        content: '',
        effectiveAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = privacyPolicySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('versionが0でもバリデーションを通す', () => {
      const data = {
        version: 0,
        content: 'テストコンテンツ',
        effectiveAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = privacyPolicySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('contentが非常に長い文字列でもバリデーションを通す', () => {
      const longContent = 'a'.repeat(100000) // 10万文字
      const data = {
        version: 1,
        content: longContent,
        effectiveAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = privacyPolicySchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('例外・制約違反', () => {
    it('versionが負の数の場合はバリデーションに失敗する', () => {
      const invalidData = {
        version: -1,
        content: 'テストコンテンツ',
        effectiveAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = privacyPolicySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('contentが存在しない場合はバリデーションに失敗する', () => {
      const invalidData = {
        version: 1,
        // content: 'missing',
        effectiveAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = privacyPolicySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('createdAtが無効な日付の場合はバリデーションに失敗する', () => {
      const invalidData = {
        version: 1,
        content: 'テストコンテンツ',
        effectiveAt: null,
        createdAt: 'invalid-date',
        updatedAt: new Date(),
      }

      const result = privacyPolicySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})

describe('privacyPolicyInputSchema', () => {
  describe('基本動作', () => {
    it('正常な入力データをバリデーションできる', () => {
      const validInput: PrivacyPolicyInput = {
        content: 'このプライバシーポリシーは...',
      }

      const result = privacyPolicyInputSchema.safeParse(validInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validInput)
      }
    })
  })

  describe('例外・制約違反', () => {
    it('contentが空文字列の場合はバリデーションに失敗する', () => {
      const invalidInput = {
        content: '',
      }

      const result = privacyPolicyInputSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('contentが存在しない場合はバリデーションに失敗する', () => {
      const invalidInput = {}

      const result = privacyPolicyInputSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })
})

describe('privacyPolicyUpdateSchema', () => {
  describe('基本動作', () => {
    it('正常な更新データをバリデーションできる', () => {
      const validUpdate: PrivacyPolicyUpdate = {
        content: '更新されたプライバシーポリシーは...',
      }

      const result = privacyPolicyUpdateSchema.safeParse(validUpdate)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validUpdate)
      }
    })
  })

  describe('例外・制約違反', () => {
    it('contentが空文字列の場合はバリデーションに失敗する', () => {
      const invalidUpdate = {
        content: '',
      }

      const result = privacyPolicyUpdateSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)
    })
  })
})

describe('privacyPolicyActivateSchema', () => {
  describe('基本動作', () => {
    it('正常な有効化データをバリデーションできる', () => {
      const validActivate: PrivacyPolicyActivate = {
        effectiveAt: new Date('2024-01-15T00:00:00Z'),
      }

      const result = privacyPolicyActivateSchema.safeParse(validActivate)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validActivate)
      }
    })
  })

  describe('例外・制約違反', () => {
    it('effectiveAtが存在しない場合はバリデーションに失敗する', () => {
      const invalidActivate = {}

      const result = privacyPolicyActivateSchema.safeParse(invalidActivate)
      expect(result.success).toBe(false)
    })

    it('effectiveAtが無効な日付の場合はバリデーションに失敗する', () => {
      const invalidActivate = {
        effectiveAt: 'invalid-date',
      }

      const result = privacyPolicyActivateSchema.safeParse(invalidActivate)
      expect(result.success).toBe(false)
    })
  })
})

describe('privacyPolicyCloneSchema', () => {
  describe('基本動作', () => {
    it('正常な複製データをバリデーションできる（空オブジェクト）', () => {
      const validClone: PrivacyPolicyClone = {}

      const result = privacyPolicyCloneSchema.safeParse(validClone)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({})
      }
    })
  })
})
