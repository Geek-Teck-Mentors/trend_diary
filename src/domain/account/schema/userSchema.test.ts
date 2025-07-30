import { userSchema } from './userSchema'

describe('ユーザースキーマ', () => {
  const validUser = {
    userId: BigInt(123456789),
    createdAt: new Date(),
  }

  it('有効なユーザーデータを受け入れること', () => {
    expect(() => {
      userSchema.parse(validUser)
    }).not.toThrow()
  })

  describe('userId のバリデーション', () => {
    it('有効なbigint型のuserIdを受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          userId: BigInt(567890123),
        })
      }).not.toThrow()
    })

    it('bigint型でないuserIdを拒否すること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          userId: '123456789',
        })
      }).toThrow()

      expect(() => {
        userSchema.parse({
          ...validUser,
          userId: 123456789,
        })
      }).toThrow()
    })
  })

  describe('createdAt のバリデーション', () => {
    it('有効なDate型のcreatedAtを受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          createdAt: new Date('2023-01-01'),
        })
      }).not.toThrow()
    })

    it('Date型でないcreatedAtを拒否すること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          createdAt: '2023-01-01',
        })
      }).toThrow()

      expect(() => {
        userSchema.parse({
          ...validUser,
          createdAt: 1672531200000,
        })
      }).toThrow()
    })
  })
})
