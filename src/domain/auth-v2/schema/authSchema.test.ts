import { authInputSchema } from './authSchema'

describe('Auth V2のスキーマ', () => {
  const validAuthInput = {
    email: 'test@example.com',
    password: 'StrongPassword123!',
  }

  it('有効な認証入力データを受け入れること', () => {
    expect(() => {
      authInputSchema.parse(validAuthInput)
    }).not.toThrow()
  })

  describe('email のバリデーション', () => {
    it('String型でないemailを拒否すること', () => {
      expect(() => {
        authInputSchema.parse({
          ...validAuthInput,
          email: 0,
        })
      }).toThrow()
    })

    it('有効なメールアドレスを受け入れること', () => {
      expect(() => {
        authInputSchema.parse({
          ...validAuthInput,
          email: 'valid@example.com',
        })
      }).not.toThrow()
    })

    it('無効なメールアドレスを拒否すること', () => {
      expect(() => {
        authInputSchema.parse({
          ...validAuthInput,
          email: 'invalid-email',
        })
      }).toThrow()
    })
  })

  describe('password のバリデーション', () => {
    it('String型でないpasswordを拒否すること', () => {
      expect(() => {
        authInputSchema.parse({
          ...validAuthInput,
          password: 12345678,
        })
      }).toThrow()
    })

    it('8文字以上のpasswordを受け入れること', () => {
      expect(() => {
        authInputSchema.parse({
          ...validAuthInput,
          password: 'StrongPass1!',
        })
      }).not.toThrow()
    })

    it('8文字未満のpasswordを拒否すること', () => {
      expect(() => {
        authInputSchema.parse({
          ...validAuthInput,
          password: 'Short1!',
        })
      }).toThrow()
    })

    describe('正規表現パターンのバリデーション', () => {
      const testCases = [
        {
          outline: '英大文字が含まれない',
          password: 'lowercase123!',
          shouldPass: false,
        },
        {
          outline: '英小文字が含まれない',
          password: 'UPPERCASE123!',
          shouldPass: false,
        },
        {
          outline: '数字が含まれない',
          password: 'NoNumberPass!',
          shouldPass: false,
        },
        {
          outline: '記号(@$!%*?&)が含まれない',
          password: 'NoSymbolPass123',
          shouldPass: false,
        },
        {
          outline: '許可されていない記号(#)を含む',
          password: 'InvalidSymbol123#',
          shouldPass: false,
        },
        {
          outline: '許可されていない記号(^)を含む',
          password: 'InvalidSymbol123^',
          shouldPass: false,
        },
        {
          outline: '許可されていない記号(+)を含む',
          password: 'InvalidSymbol123+',
          shouldPass: false,
        },
        {
          outline: '全ての条件を満たす(@)',
          password: 'Aa1@5678',
          shouldPass: true,
        },
        {
          outline: '全ての条件を満たす($)',
          password: 'Test$123',
          shouldPass: true,
        },
        {
          outline: '全ての条件を満たす(!)',
          password: 'Pass!123',
          shouldPass: true,
        },
        {
          outline: '全ての条件を満たす(%)',
          password: 'Pass%123',
          shouldPass: true,
        },
        {
          outline: '全ての条件を満たす(*)',
          password: 'Word*456',
          shouldPass: true,
        },
        {
          outline: '全ての条件を満たす(?)',
          password: 'Strong?789',
          shouldPass: true,
        },
        {
          outline: '全ての条件を満たす(&)',
          password: 'Secure&012',
          shouldPass: true,
        },
      ]

      for (const { outline, password, shouldPass } of testCases) {
        it(`${outline}: ${password}`, () => {
          const expectation = expect(() => {
            authInputSchema.parse({
              ...validAuthInput,
              password,
            })
          })

          if (shouldPass) {
            expectation.not.toThrow()
          } else {
            expectation.toThrow()
          }
        })
      }
    })
  })
})
