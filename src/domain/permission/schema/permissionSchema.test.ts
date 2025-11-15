import { describe, expect, it } from 'vitest'
import { permissionInputSchema, permissionSchema } from './permissionSchema'

describe('permissionSchema', () => {
  describe('正常系', () => {
    it('有効なパーミッションデータをパースできる', () => {
      const validData = {
        permissionId: 1,
        resource: 'article',
        action: 'read',
      }

      const result = permissionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('permissionIdが負の数の場合エラー', () => {
      const invalidData = {
        permissionId: -1,
        resource: 'article',
        action: 'read',
      }

      const result = permissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('resourceが空文字の場合エラー', () => {
      const invalidData = {
        permissionId: 1,
        resource: '',
        action: 'read',
      }

      const result = permissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('actionが空文字の場合エラー', () => {
      const invalidData = {
        permissionId: 1,
        resource: 'article',
        action: '',
      }

      const result = permissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})

describe('permissionInputSchema', () => {
  it('有効な入力データをパースできる', () => {
    const validData = {
      resource: 'article',
      action: 'read',
    }

    const result = permissionInputSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})
