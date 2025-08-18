import { userListResultSchema } from './userListSchema'

describe('userListResultSchema', () => {
  const validUserListResult = {
    users: [
      {
        activeUserId: 123456789n,
        email: 'test@example.com',
        displayName: 'Test User',
        isAdmin: false,
        grantedAt: null,
        grantedByAdminUserId: null,
        createdAt: new Date(),
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
  }

  it('有効なUserListResultデータを受け入れること', () => {
    expect(() => {
      userListResultSchema.parse(validUserListResult)
    }).not.toThrow()
  })

  describe('users のバリデーション', () => {
    it('空の配列を受け入れること', () => {
      expect(() => {
        userListResultSchema.parse({
          ...validUserListResult,
          users: [],
        })
      }).not.toThrow()
    })

    it('複数のユーザーを含む配列を受け入れること', () => {
      expect(() => {
        userListResultSchema.parse({
          ...validUserListResult,
          users: [
            ...validUserListResult.users,
            {
              activeUserId: 987654321n,
              email: 'user2@example.com',
              displayName: 'User Two',
              isAdmin: true,
              grantedAt: new Date(),
              grantedByAdminUserId: 1,
              createdAt: new Date(),
            },
          ],
        })
      }).not.toThrow()
    })

    it('配列でないusersを拒否すること', () => {
      expect(() => {
        userListResultSchema.parse({
          ...validUserListResult,
          users: 'not-array',
        })
      }).toThrow()
    })
  })

  describe('total のバリデーション', () => {
    it('0以上の整数のtotalを受け入れること', () => {
      expect(() => {
        userListResultSchema.parse({
          ...validUserListResult,
          total: 0,
        })
      }).not.toThrow()

      expect(() => {
        userListResultSchema.parse({
          ...validUserListResult,
          total: 100,
        })
      }).not.toThrow()
    })

    it('負の数のtotalを拒否すること', () => {
      expect(() => {
        userListResultSchema.parse({
          ...validUserListResult,
          total: -1,
        })
      }).toThrow()
    })

    it('小数点のtotalを拒否すること', () => {
      expect(() => {
        userListResultSchema.parse({
          ...validUserListResult,
          total: 1.5,
        })
      }).toThrow()
    })
  })

  describe('page のバリデーション', () => {
    it('正の整数のpageを受け入れること', () => {
      expect(() => {
        userListResultSchema.parse({
          ...validUserListResult,
          page: 1,
        })
      }).not.toThrow()

      expect(() => {
        userListResultSchema.parse({
          ...validUserListResult,
          page: 999,
        })
      }).not.toThrow()
    })

    it('0以下のpageを拒否すること', () => {
      expect(() => {
        userListResultSchema.parse({
          ...validUserListResult,
          page: 0,
        })
      }).toThrow()
    })
  })

  describe('limit のバリデーション', () => {
    it('正の整数のlimitを受け入れること', () => {
      expect(() => {
        userListResultSchema.parse({
          ...validUserListResult,
          limit: 10,
        })
      }).not.toThrow()

      expect(() => {
        userListResultSchema.parse({
          ...validUserListResult,
          limit: 100,
        })
      }).not.toThrow()
    })

    it('0以下のlimitを拒否すること', () => {
      expect(() => {
        userListResultSchema.parse({
          ...validUserListResult,
          limit: 0,
        })
      }).toThrow()
    })
  })

  describe('必須フィールドのバリデーション', () => {
    it('usersが欠落している場合を拒否すること', () => {
      const { users: _, ...incompleteData } = validUserListResult
      expect(() => {
        userListResultSchema.parse(incompleteData)
      }).toThrow()
    })

    it('totalが欠落している場合を拒否すること', () => {
      const { total: _, ...incompleteData } = validUserListResult
      expect(() => {
        userListResultSchema.parse(incompleteData)
      }).toThrow()
    })

    it('pageが欠落している場合を拒否すること', () => {
      const { page: _, ...incompleteData } = validUserListResult
      expect(() => {
        userListResultSchema.parse(incompleteData)
      }).toThrow()
    })

    it('limitが欠落している場合を拒否すること', () => {
      const { limit: _, ...incompleteData } = validUserListResult
      expect(() => {
        userListResultSchema.parse(incompleteData)
      }).toThrow()
    })
  })
})
