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
  const validCases = [
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

  for (const { name, input, expected } of validCases) {
    it(name, () => {
      expect(offsetPaginationSchema.parse(input)).toEqual(expected)
    })
  }

  const invalidCases = [
    { name: 'pageが文字列', input: { page: 'abc' }, message: 'Expected number, received nan' },
    { name: 'limitが文字列', input: { limit: 'invalid' }, message: 'Expected number, received nan' },
    { name: 'pageが0', input: { page: 0 }, message: 'Number must be greater than or equal to 1' },
    { name: 'pageが負の値', input: { page: -1 }, message: 'Number must be greater than or equal to 1' },
    { name: 'pageが大きな負の値', input: { page: -999 }, message: 'Number must be greater than or equal to 1' },
    { name: 'pageが小数', input: { page: 1.5 }, message: 'Expected integer' },
    { name: 'pageが1未満の小数', input: { page: 0.9 }, message: 'Expected integer' },
    { name: `limitが${MIN_LIMIT}未満`, input: { limit: 0 }, message: `Number must be greater than or equal to ${MIN_LIMIT}` },
    { name: 'limitが負の値', input: { limit: -10 }, message: `Number must be greater than or equal to ${MIN_LIMIT}` },
    { name: `limitが${MAX_LIMIT}より大きい`, input: { limit: 101 }, message: `Number must be less than or equal to ${MAX_LIMIT}` },
    { name: 'limitが大きな値', input: { limit: 500 }, message: `Number must be less than or equal to ${MAX_LIMIT}` },
  ]

  for (const { name, input, message } of invalidCases) {
    it(`${name}ならバリデーションエラー`, () => {
      expect(() => offsetPaginationSchema.parse(input)).toThrow(message)
    })
  }
})

describe('offsetPaginationMobileSchema', () => {
  const validCases = [
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

  for (const { name, input, expected } of validCases) {
    it(name, () => {
      expect(offsetPaginationMobileSchema.parse(input)).toEqual(expected)
    })
  }

  const invalidCases = [
    { name: 'pageが文字列', input: { page: 'abc' }, message: 'Expected number, received nan' },
    { name: 'limitが文字列', input: { limit: 'invalid' }, message: 'Expected number, received nan' },
    { name: 'pageが0', input: { page: 0 }, message: 'Number must be greater than or equal to 1' },
    { name: 'pageが負の値', input: { page: -1 }, message: 'Number must be greater than or equal to 1' },
    { name: 'pageが小数', input: { page: 1.5 }, message: 'Expected integer' },
    { name: `limitが${MIN_LIMIT}未満`, input: { limit: 0 }, message: `Number must be greater than or equal to ${MIN_LIMIT}` },
    { name: 'limitが負の値', input: { limit: -10 }, message: `Number must be greater than or equal to ${MIN_LIMIT}` },
    { name: `limitが${MAX_LIMIT}より大きい`, input: { limit: 101 }, message: `Number must be less than or equal to ${MAX_LIMIT}` },
    { name: 'limitが大きな値', input: { limit: 500 }, message: `Number must be less than or equal to ${MAX_LIMIT}` },
  ]

  for (const { name, input, message } of invalidCases) {
    it(`${name}ならバリデーションエラー`, () => {
      expect(() => offsetPaginationMobileSchema.parse(input)).toThrow(message)
    })
  }
})
