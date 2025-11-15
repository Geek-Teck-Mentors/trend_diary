import { describe, expect, it } from 'vitest'
import {
  userRoleInputSchema,
  userRoleRevokeSchema,
  userRoleSchema,
} from './userRoleSchema'

describe('userRoleSchema', () => {
  describe('正常系', () => {
    it('有効なユーザーロールデータをパースできる', () => {
      const validData = {
        activeUserId: BigInt(1),
        roleId: 1,
        grantedAt: new Date(),
      }

      const result = userRoleSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('異常系', () => {
    it('activeUserIdが負の数の場合エラー', () => {
      const invalidData = {
        activeUserId: BigInt(-1),
        roleId: 1,
        grantedAt: new Date(),
      }

      const result = userRoleSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('roleIdが負の数の場合エラー', () => {
      const invalidData = {
        activeUserId: BigInt(1),
        roleId: -1,
        grantedAt: new Date(),
      }

      const result = userRoleSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})

describe('userRoleInputSchema', () => {
  it('有効な入力データをパースできる', () => {
    const validData = {
      activeUserId: BigInt(1),
      roleId: 1,
    }

    const result = userRoleInputSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})

describe('userRoleRevokeSchema', () => {
  it('有効な剥奪データをパースできる', () => {
    const validData = {
      activeUserId: BigInt(1),
      roleId: 1,
    }

    const result = userRoleRevokeSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})
