import { describe, expect, it } from 'vitest'
import { endpointPermissionInputSchema, endpointPermissionSchema } from './endpointPermissionSchema'

describe('endpointPermissionSchema', () => {
  describe('正常系', () => {
    it('有効なエンドポイントパーミッションデータをパースできる', () => {
      const validData = {
        endpointId: 1,
        permissionId: 1,
      }

      const result = endpointPermissionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('endpointIdが負の数の場合エラー', () => {
      const invalidData = {
        endpointId: -1,
        permissionId: 1,
      }

      const result = endpointPermissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('permissionIdが負の数の場合エラー', () => {
      const invalidData = {
        endpointId: 1,
        permissionId: -1,
      }

      const result = endpointPermissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('必須フィールドが欠損している場合エラー', () => {
      const invalidData = {
        endpointId: 1,
        // permissionId が欠損
      }

      const result = endpointPermissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})

describe('endpointPermissionInputSchema', () => {
  it('有効な入力データをパースできる', () => {
    const validData = {
      endpointId: 1,
      permissionId: 1,
    }

    const result = endpointPermissionInputSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})
