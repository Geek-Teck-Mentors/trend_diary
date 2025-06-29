import { accountSchema } from './accountSchema'

describe('アカウントスキーマ', () => {
  const validAccount = {
    accountId: BigInt(123456789),
    email: 'test@example.com',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  }

  it('有効なアカウントデータを受け入れること', () => {
    expect(() => {
      accountSchema.parse(validAccount)
    }).not.toThrow()
  })

  describe('accountId のバリデーション', () => {
    it('有効なbigint型のaccountIdを受け入れること', () => {
      expect(() => {
        accountSchema.parse({
          ...validAccount,
          accountId: BigInt(987654321),
        })
      }).not.toThrow()
    })

    it('bigint型でないaccountIdを拒否すること', () => {
      expect(() => {
        accountSchema.parse({
          ...validAccount,
          accountId: '123456789',
        })
      }).toThrow()

      expect(() => {
        accountSchema.parse({
          ...validAccount,
          accountId: 123456789,
        })
      }).toThrow()
    })
  })

  describe('メールアドレスのバリデーション', () => {
    it('有効なメールアドレス形式を受け入れること', () => {
      expect(() => {
        accountSchema.parse({
          ...validAccount,
          email: 'valid.email@example.co.jp',
        })
      }).not.toThrow()
    })

    it('不正な形式のメールアドレスを拒否すること', () => {
      expect(() => {
        accountSchema.parse({
          ...validAccount,
          email: 'invalid-email',
        })
      }).toThrow()
    })
  })

  describe('パスワードのバリデーション', () => {
    it('境界値のパスワードを受け入れること', () => {
      expect(() => {
        accountSchema.parse({
          ...validAccount,
          password: '12345678', // 8文字
        })
      }).not.toThrow()

      expect(() => {
        accountSchema.parse({
          ...validAccount,
          password: 'a'.repeat(50), // 50文字
        })
      }).not.toThrow()
    })

    it('8文字未満のパスワードを拒否すること', () => {
      expect(() => {
        accountSchema.parse({
          ...validAccount,
          password: '1234567',
        })
      }).toThrow()
    })

    it('50文字を超えるパスワードを拒否すること', () => {
      expect(() => {
        accountSchema.parse({
          ...validAccount,
          password: 'a'.repeat(51),
        })
      }).toThrow()
    })
  })

  describe('lastLogin', () => {
    it('lastLoginが提供されている場合に受け入れること', () => {
      expect(() => {
        accountSchema.parse({
          ...validAccount,
          lastLogin: new Date(),
        })
      }).not.toThrow()
    })

    it('lastLoginが提供されていない場合も受け入れること', () => {
      const { ...accountWithoutLastLogin } = {
        ...validAccount,
        lastLogin: new Date(),
      }
      expect(() => {
        accountSchema.parse(accountWithoutLastLogin)
      }).not.toThrow()
    })

    it('日付型でないlastLoginを拒否すること', () => {
      expect(() => {
        accountSchema.parse({
          ...validAccount,
          lastLogin: 'not-a-date',
        })
      }).toThrow()
    })
  })
})
