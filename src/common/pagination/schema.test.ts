import { describe, expect, it } from 'vitest'

import {
  createOffsetPaginationSchema,
  DEFAULT_LIMIT,
  DEFAULT_MOBILE_LIMIT,
  DEFAULT_PAGE,
  offsetPaginationSchema,
} from './schema'

describe('offsetPaginationSchema', () => {
  const cases = [
    {
      name: '空入力ならデフォルト値',
      input: {},
      expected: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT },
    },
    {
      name: '文字列を数値に変換する',
      input: { page: '3', limit: '45' },
      expected: { page: 3, limit: 45 },
    },
    {
      name: '不正な値はデフォルトへフォールバック',
      input: { page: 'abc', limit: 'NaN' },
      expected: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT },
    },
    {
      name: 'pageが1未満なら1にクランプ',
      input: { page: 0 },
      expected: { page: 1, limit: DEFAULT_LIMIT },
    },
    {
      name: 'limitが1未満なら1にクランプ',
      input: { limit: -10 },
      expected: { page: DEFAULT_PAGE, limit: 1 },
    },
    {
      name: 'limitが100より大きい場合は100にクランプ',
      input: { limit: 500 },
      expected: { page: DEFAULT_PAGE, limit: 100 },
    },
  ] as const

  for (const { name, input, expected } of cases) {
    it(name, () => {
      const result = offsetPaginationSchema.parse(input)
      expect(result).toEqual(expected)
    })
  }
})

describe('createOffsetPaginationSchema', () => {
  it('カスタムデフォルト値を指定できる', () => {
    const customDefault = 10
    const schema = createOffsetPaginationSchema(customDefault)
    const result = schema.parse({})
    expect(result).toEqual({ page: DEFAULT_PAGE, limit: customDefault })
  })

  it('モバイル用のデフォルト値を使用できる', () => {
    const schema = createOffsetPaginationSchema(DEFAULT_MOBILE_LIMIT)
    const result = schema.parse({})
    expect(result).toEqual({ page: DEFAULT_PAGE, limit: DEFAULT_MOBILE_LIMIT })
  })

  it('明示的にlimitを指定すればカスタムデフォルト値より優先される', () => {
    const schema = createOffsetPaginationSchema(10)
    const result = schema.parse({ limit: 50 })
    expect(result).toEqual({ page: DEFAULT_PAGE, limit: 50 })
  })

  it('カスタムデフォルト値でもバリデーション（1-100の範囲）は機能する', () => {
    const schema = createOffsetPaginationSchema(10)
    const resultMin = schema.parse({ limit: -5 })
    const resultMax = schema.parse({ limit: 200 })
    expect(resultMin.limit).toBe(1)
    expect(resultMax.limit).toBe(100)
  })

  it('不正な値の場合はカスタムデフォルト値にフォールバックする', () => {
    const customDefault = 15
    const schema = createOffsetPaginationSchema(customDefault)
    const result = schema.parse({ limit: 'invalid' })
    expect(result).toEqual({ page: DEFAULT_PAGE, limit: customDefault })
  })
})
