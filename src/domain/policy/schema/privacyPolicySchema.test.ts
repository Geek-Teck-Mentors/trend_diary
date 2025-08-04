import { privacyPolicyActivateSchema, privacyPolicySchema } from './privacyPolicySchema'

describe('privacyPolicySchema', () => {
  const table = [
    {
      group: '基本動作',
      name: '正常なプライバシーポリシーデータをバリデーションできる',
      data: {
        version: 1,
        content: 'このプライバシーポリシーは...',
        effectiveAt: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      expected: true,
    },
    {
      group: '基本動作',
      name: '有効化されたプライバシーポリシーデータをバリデーションできる',
      data: {
        version: 2,
        content: '更新されたプライバシーポリシーは...',
        effectiveAt: new Date('2024-01-15T00:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      expected: true,
    },
    {
      group: '境界値・特殊値',
      name: 'contentが空文字列の場合',
      data: {
        version: 1,
        content: '',
        effectiveAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      expected: false,
    },
    {
      group: '境界値・特殊値',
      name: 'versionは1以上',
      data: {
        version: 0,
        content: 'テストコンテンツ',
        effectiveAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      expected: false,
    },
    {
      group: '境界値・特殊値',
      name: 'contentが非常に長い文字列でもバリデーションを通す',
      data: {
        version: 1,
        content: 'a'.repeat(100000),
        effectiveAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      expected: true,
    },
    {
      group: '例外・制約違反',
      name: 'versionが負の数の場合はバリデーションに失敗する',
      data: {
        version: -1,
        content: 'テストコンテンツ',
        effectiveAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      expected: false,
    },
    {
      group: '例外・制約違反',
      name: 'contentが存在しない場合はバリデーションに失敗する',
      data: {
        version: 1,
        // content: 'missing',
        effectiveAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      expected: false,
    },
    {
      group: '例外・制約違反',
      name: 'createdAtが無効な日付の場合はバリデーションに失敗する',
      data: {
        version: 1,
        content: 'テストコンテンツ',
        effectiveAt: null,
        createdAt: 'invalid-date',
        updatedAt: new Date(),
      },
      expected: false,
    },
  ]

  table.forEach(({ group, name, data, expected }) => {
    describe(group, () => {
      it(name, () => {
        const result = privacyPolicySchema.safeParse(data)
        expect(result.success).toBe(expected)
      })
    })
  })
})

describe('privacyPolicyActivateSchema', () => {
  describe('基本動作', () => {
    it('正常な有効化データをバリデーションできる', () => {
      const validActivate = {
        effectiveAt: '2024-01-15T00:00:00Z',
      }

      const result = privacyPolicyActivateSchema.safeParse(validActivate)
      expect(result.success).toBe(true)
    })
  })

  describe('例外・制約違反', () => {
    it('effectiveAtが存在しない場合はバリデーションに失敗する', () => {
      const invalidActivate = {}

      const result = privacyPolicyActivateSchema.safeParse(invalidActivate)
      expect(result.success).toBe(false)
    })

    it('effectiveAtが無効な日付の場合はバリデーションに失敗する', () => {
      const invalidActivate = {
        effectiveAt: 'invalid-date',
      }

      const result = privacyPolicyActivateSchema.safeParse(invalidActivate)
      expect(result.success).toBe(false)
    })
  })
})
