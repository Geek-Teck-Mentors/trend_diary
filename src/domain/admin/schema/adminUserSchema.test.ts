import { adminUserSchema } from './adminUserSchema'

describe('adminUserSchema', () => {
  const validAdminUser = {
    adminUserId: 1,
    activeUserId: 123456789n,
    grantedAt: new Date(),
    grantedByAdminUserId: 2n,
  }

  it('有効なAdmin Userデータを受け入れること', () => {
    expect(() => {
      adminUserSchema.parse(validAdminUser)
    }).not.toThrow()
  })

  describe('adminUserId のバリデーション', () => {
    it('有効な正の整数のadminUserIdを受け入れること', () => {
      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          adminUserId: 999999,
        })
      }).not.toThrow()
    })

    it('0以下のadminUserIdを拒否すること', () => {
      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          adminUserId: 0,
        })
      }).toThrow()

      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          adminUserId: -1,
        })
      }).toThrow()
    })

    it('小数点のadminUserIdを拒否すること', () => {
      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          adminUserId: 1.5,
        })
      }).toThrow()
    })

    it('数値型でないadminUserIdを拒否すること', () => {
      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          adminUserId: '1',
        })
      }).toThrow()

      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          adminUserId: true,
        })
      }).toThrow()
    })
  })

  describe('activeUserId のバリデーション', () => {
    it('有効な正のbigint型のactiveUserIdを受け入れること', () => {
      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          activeUserId: 9007199254740991n, // Number.MAX_SAFE_INTEGER
        })
      }).not.toThrow()

      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          activeUserId: 123456789012345678901234567890n, // 非常に大きな値
        })
      }).not.toThrow()
    })

    it('0以下のactiveUserIdを拒否すること', () => {
      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          activeUserId: 0n,
        })
      }).toThrow()

      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          activeUserId: -1n,
        })
      }).toThrow()
    })

    it('bigint型でないactiveUserIdを拒否すること', () => {
      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          activeUserId: 123456789,
        })
      }).toThrow()

      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          activeUserId: '123456789',
        })
      }).toThrow()

      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          activeUserId: true,
        })
      }).toThrow()
    })
  })

  describe('grantedAt のバリデーション', () => {
    it('有効なDate型のgrantedAtを受け入れること', () => {
      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          grantedAt: new Date('2024-01-15T09:30:15.123Z'),
        })
      }).not.toThrow()

      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          grantedAt: new Date('1970-01-01T00:00:00.000Z'), // Unix epoch
        })
      }).not.toThrow()

      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          grantedAt: new Date('2099-12-31T23:59:59.999Z'), // 遠い未来
        })
      }).not.toThrow()
    })

    it('Date型でないgrantedAtを拒否すること', () => {
      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          grantedAt: '2024-01-15T09:30:15.123Z',
        })
      }).toThrow()

      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          grantedAt: 1642233015123,
        })
      }).toThrow()

      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          grantedAt: null,
        })
      }).toThrow()
    })
  })

  describe('grantedByAdminUserId のバリデーション', () => {
    it('有効な正のbigint型のgrantedByAdminUserIdを受け入れること', () => {
      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          grantedByAdminUserId: 999999n,
        })
      }).not.toThrow()

      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          grantedByAdminUserId: 9007199254740991n,
        })
      }).not.toThrow()
    })

    it('0以下のgrantedByAdminUserIdを拒否すること', () => {
      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          grantedByAdminUserId: 0n,
        })
      }).toThrow()

      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          grantedByAdminUserId: -1n,
        })
      }).toThrow()
    })

    it('bigint型でないgrantedByAdminUserIdを拒否すること', () => {
      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          grantedByAdminUserId: 123,
        })
      }).toThrow()

      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          grantedByAdminUserId: '1',
        })
      }).toThrow()

      expect(() => {
        adminUserSchema.parse({
          ...validAdminUser,
          grantedByAdminUserId: true,
        })
      }).toThrow()
    })
  })

  describe('必須フィールドのバリデーション', () => {
    it('adminUserIdが欠落している場合を拒否すること', () => {
      const { adminUserId: _, ...incompleteData } = validAdminUser
      expect(() => {
        adminUserSchema.parse(incompleteData)
      }).toThrow()
    })

    it('activeUserIdが欠落している場合を拒否すること', () => {
      const { activeUserId: _, ...incompleteData } = validAdminUser
      expect(() => {
        adminUserSchema.parse(incompleteData)
      }).toThrow()
    })

    it('grantedAtが欠落している場合を拒否すること', () => {
      const { grantedAt: _, ...incompleteData } = validAdminUser
      expect(() => {
        adminUserSchema.parse(incompleteData)
      }).toThrow()
    })

    it('grantedByAdminUserIdが欠落している場合を拒否すること', () => {
      const { grantedByAdminUserId: _, ...incompleteData } = validAdminUser
      expect(() => {
        adminUserSchema.parse(incompleteData)
      }).toThrow()
    })
  })
})
