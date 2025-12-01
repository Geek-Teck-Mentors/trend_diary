import { describe, expect, it } from 'vitest'
import { roleInputSchema, roleSchema, roleUpdateSchema } from './roleSchema'

describe('roleSchema', () => {
  describe('正常系', () => {
    it('有効なロールデータをパースできる', () => {
      const validData = {
        roleId: 1,
        preset: false,
        displayName: '管理者',
        description: 'システム管理者',
        createdAt: new Date(),
      }

      const result = roleSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('descriptionがnullでもパースできる', () => {
      const validData = {
        roleId: 1,
        preset: false,
        displayName: '管理者',
        description: null,
        createdAt: new Date(),
      }

      const result = roleSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('roleIdが負の数の場合エラー', () => {
      const invalidData = {
        roleId: -1,
        preset: false,
        displayName: '管理者',
        description: 'テスト',
        createdAt: new Date(),
      }

      const result = roleSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('displayNameが空文字の場合エラー', () => {
      const invalidData = {
        roleId: 1,
        preset: false,
        displayName: '',
        description: 'テスト',
        createdAt: new Date(),
      }

      const result = roleSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})

describe('roleInputSchema', () => {
  it('有効な入力データをパースできる', () => {
    const validData = {
      displayName: '管理者',
      description: 'システム管理者',
    }

    const result = roleInputSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})

describe('roleUpdateSchema', () => {
  it('有効な更新データをパースできる', () => {
    const validData = {
      displayName: '管理者',
      description: 'システム管理者',
    }

    const result = roleUpdateSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})
