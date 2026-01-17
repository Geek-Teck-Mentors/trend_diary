import { describe, expect, it } from 'vitest'

import {
  DEFAULT_LIMIT,
  DEFAULT_MOBILE_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  MIN_LIMIT,
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

  it(`limitが${MIN_LIMIT}未満ならバリデーションエラー`, () => {
    expect(() => offsetPaginationSchema.parse({ limit: 0 })).toThrow()
    expect(() => offsetPaginationSchema.parse({ limit: -10 })).toThrow()
  })

  it(`limitが${MAX_LIMIT}より大きいならバリデーションエラー`, () => {
    expect(() => offsetPaginationSchema.parse({ limit: 101 })).toThrow()
    expect(() => offsetPaginationSchema.parse({ limit: 500 })).toThrow()
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

  it(`limitが${MIN_LIMIT}未満ならバリデーションエラー`, () => {
    expect(() => offsetPaginationMobileSchema.parse({ limit: 0 })).toThrow()
    expect(() => offsetPaginationMobileSchema.parse({ limit: -10 })).toThrow()
  })

  it(`limitが${MAX_LIMIT}より大きいならバリデーションエラー`, () => {
    expect(() => offsetPaginationMobileSchema.parse({ limit: 101 })).toThrow()
    expect(() => offsetPaginationMobileSchema.parse({ limit: 500 })).toThrow()
  })
})
