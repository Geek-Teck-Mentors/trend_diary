import { userSchema } from './userSchema'

describe('userSchema', () => {
  const validUser = {
    userId: 123456789n,
    email: 'test@example.com',
    displayName: 'Test User',
    isAdmin: false,
    grantedAt: null,
    grantedByAdminUserId: null,
    createdAt: new Date(),
  }

  it('有効なUserデータを受け入れること', () => {
    expect(() => {
      userSchema.parse(validUser)
    }).not.toThrow()
  })

  describe('userId のバリデーション', () => {
    it('有効な正のbigint型のuserIdを受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          userId: 9007199254740991n,
        })
      }).not.toThrow()
    })

    it('0以下のuserIdを拒否すること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          userId: 0n,
        })
      }).toThrow()
    })

    it('bigint型でないuserIdを拒否すること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          userId: 123456789,
        })
      }).toThrow()
    })
  })

  describe('email のバリデーション', () => {
    it('有効なメールアドレスを受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          email: 'user@example.com',
        })
      }).not.toThrow()
    })

    it('無効なメールアドレスを拒否すること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          email: 'invalid-email',
        })
      }).toThrow()
    })
  })

  describe('displayName のバリデーション', () => {
    it('文字列のdisplayNameを受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          displayName: 'John Doe',
        })
      }).not.toThrow()
    })

    it('null のdisplayNameを受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          displayName: null,
        })
      }).not.toThrow()
    })
  })

  describe('isAdmin のバリデーション', () => {
    it('boolean型のisAdminを受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          isAdmin: true,
        })
      }).not.toThrow()

      expect(() => {
        userSchema.parse({
          ...validUser,
          isAdmin: false,
        })
      }).not.toThrow()
    })

    it('boolean型でないisAdminを拒否すること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          isAdmin: 'true',
        })
      }).toThrow()
    })
  })

  describe('grantedAt のバリデーション', () => {
    it('Date型のgrantedAtを受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          grantedAt: new Date(),
        })
      }).not.toThrow()
    })

    it('null のgrantedAtを受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          grantedAt: null,
        })
      }).not.toThrow()
    })
  })

  describe('grantedByAdminUserId のバリデーション', () => {
    it('正の整数のgrantedByAdminUserIdを受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          grantedByAdminUserId: 1,
        })
      }).not.toThrow()
    })

    it('null のgrantedByAdminUserIdを受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          grantedByAdminUserId: null,
        })
      }).not.toThrow()
    })

    it('0以下のgrantedByAdminUserIdを拒否すること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          grantedByAdminUserId: 0,
        })
      }).toThrow()
    })
  })

  describe('createdAt のバリデーション', () => {
    it('Date型のcreatedAtを受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          createdAt: new Date(),
        })
      }).not.toThrow()
    })

    it('Date型でないcreatedAtを拒否すること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          createdAt: '2024-01-15',
        })
      }).toThrow()
    })
  })
})
