import { userSearchQuerySchema } from './userSearchSchema'

describe('userSearchQuerySchema', () => {
  it('空のオブジェクトを受け入れること', () => {
    expect(() => {
      userSearchQuerySchema.parse({})
    }).not.toThrow()
  })

  it('有効な検索クエリを受け入れること', () => {
    expect(() => {
      userSearchQuerySchema.parse({
        searchQuery: 'test',
        page: 1,
        limit: 20,
      })
    }).not.toThrow()
  })

  describe('searchQuery のバリデーション', () => {
    it('文字列のsearchQueryを受け入れること', () => {
      expect(() => {
        userSearchQuerySchema.parse({
          searchQuery: 'test query',
        })
      }).not.toThrow()
    })

    it('undefinedのsearchQueryを受け入れること', () => {
      expect(() => {
        userSearchQuerySchema.parse({})
      }).not.toThrow()
    })

    it('文字列でないsearchQueryを拒否すること', () => {
      expect(() => {
        userSearchQuerySchema.parse({
          searchQuery: 123,
        })
      }).toThrow()
    })
  })

  describe('page のバリデーション', () => {
    it('正の整数のpageを受け入れること', () => {
      expect(() => {
        userSearchQuerySchema.parse({
          page: 1,
        })
      }).not.toThrow()

      expect(() => {
        userSearchQuerySchema.parse({
          page: 999,
        })
      }).not.toThrow()
    })

    it('undefinedのpageを受け入れること', () => {
      expect(() => {
        userSearchQuerySchema.parse({})
      }).not.toThrow()
    })

    it('0以下のpageを拒否すること', () => {
      expect(() => {
        userSearchQuerySchema.parse({
          page: 0,
        })
      }).toThrow()

      expect(() => {
        userSearchQuerySchema.parse({
          page: -1,
        })
      }).toThrow()
    })

    it('小数点のpageを拒否すること', () => {
      expect(() => {
        userSearchQuerySchema.parse({
          page: 1.5,
        })
      }).toThrow()
    })
  })

  describe('limit のバリデーション', () => {
    it('正の整数のlimitを受け入れること', () => {
      expect(() => {
        userSearchQuerySchema.parse({
          limit: 10,
        })
      }).not.toThrow()

      expect(() => {
        userSearchQuerySchema.parse({
          limit: 100,
        })
      }).not.toThrow()
    })

    it('undefinedのlimitを受け入れること', () => {
      expect(() => {
        userSearchQuerySchema.parse({})
      }).not.toThrow()
    })

    it('0以下のlimitを拒否すること', () => {
      expect(() => {
        userSearchQuerySchema.parse({
          limit: 0,
        })
      }).toThrow()

      expect(() => {
        userSearchQuerySchema.parse({
          limit: -1,
        })
      }).toThrow()
    })
  })
})
