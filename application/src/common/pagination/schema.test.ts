import { describe, expect, it } from 'vitest'

import {
  DEFAULT_LIMIT,
  DEFAULT_MOBILE_LIMIT,
  DEFAULT_PAGE,
  offsetPaginationMobileSchema,
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

  it('不正な値はバリデーションエラーになる', () => {
    expect(() => offsetPaginationSchema.parse({ page: 'abc' })).toThrow()
    expect(() => offsetPaginationSchema.parse({ limit: 'invalid' })).toThrow()
  })
})

describe('offsetPaginationMobileSchema', () => {
  const cases = [
    {
      name: '空入力ならデフォルト値',
      input: {},
      expected: { page: DEFAULT_PAGE, limit: DEFAULT_MOBILE_LIMIT },
    },
    {
      name: '文字列を数値に変換する',
      input: { page: '3', limit: '15' },
      expected: { page: 3, limit: 15 },
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
      const result = offsetPaginationMobileSchema.parse(input)
      expect(result).toEqual(expected)
    })
  }

  it('不正な値はバリデーションエラーになる', () => {
    expect(() => offsetPaginationMobileSchema.parse({ page: 'abc' })).toThrow()
    expect(() => offsetPaginationMobileSchema.parse({ limit: 'invalid' })).toThrow()
  })
})
