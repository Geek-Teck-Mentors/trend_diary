import { describe, expect, it } from 'vitest'
import { rolePermissionInputSchema, rolePermissionSchema } from './rolePermissionSchema'

describe('rolePermissionSchema', () => {
  describe('正常系', () => {
    it('有効なロールパーミッションデータをパースできる', () => {
      const validData = {
        roleId: 1,
        permissionId: 1,
      }

      const result = rolePermissionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('roleIdが負の数の場合エラー', () => {
      const invalidData = {
        roleId: -1,
        permissionId: 1,
      }

      const result = rolePermissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('permissionIdが負の数の場合エラー', () => {
      const invalidData = {
        roleId: 1,
        permissionId: -1,
      }

      const result = rolePermissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('必須フィールドが欠損している場合エラー', () => {
      const invalidData = {
        roleId: 1,
        // permissionId が欠損
      }

      const result = rolePermissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})

describe('rolePermissionInputSchema', () => {
  it('有効な入力データをパースできる', () => {
    const validData = {
      roleId: 1,
      permissionId: 1,
    }

    const result = rolePermissionInputSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})
