import { describe, expect, it } from 'vitest'

import { DEFAULT_LIMIT, DEFAULT_PAGE, offsetPaginationSchema } from './schema'

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
  ] as const

  for (const { name, input, expected } of cases) {
    const result = offsetPaginationSchema.parse(input)
    it(name, () => {
      expect(result).toEqual(expected)
    })
  }
})
