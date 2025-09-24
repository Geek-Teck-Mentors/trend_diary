import { toJaDateString } from './date'

describe('Date Utils', () => {
  describe('toJaDateString', () => {
    it('日付が日本語形式で正しくフォーマットされること', () => {
      const date = new Date('2024-01-01T00:00:00Z')
      const formatted = toJaDateString(date)

      expect(formatted).toBe('2024/1/1')
    })
  })
})
