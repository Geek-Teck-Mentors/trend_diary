import { describe, expect, it } from 'vitest'
import { endpointInputSchema, endpointSchema } from './endpointSchema'

describe('endpointSchema', () => {
  describe('正常系', () => {
    it('有効なエンドポイントデータをパースできる', () => {
      const validData = {
        endpointId: 1,
        path: '/api/articles',
        method: 'GET',
        createdAt: new Date(),
      }

      const result = endpointSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('endpointIdが負の数の場合エラー', () => {
      const invalidData = {
        endpointId: -1,
        path: '/api/articles',
        method: 'GET',
        createdAt: new Date(),
      }

      const result = endpointSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('pathが空文字の場合エラー', () => {
      const invalidData = {
        endpointId: 1,
        path: '',
        method: 'GET',
        createdAt: new Date(),
      }

      const result = endpointSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('methodが空文字の場合エラー', () => {
      const invalidData = {
        endpointId: 1,
        path: '/api/articles',
        method: '',
        createdAt: new Date(),
      }

      const result = endpointSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('必須フィールドが欠損している場合エラー', () => {
      const invalidData = {
        endpointId: 1,
        path: '/api/articles',
        // method が欠損
      }

      const result = endpointSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})

describe('endpointInputSchema', () => {
  it('有効な入力データをパースできる', () => {
    const validData = {
      path: '/api/articles',
      method: 'GET',
    }

    const result = endpointInputSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})
