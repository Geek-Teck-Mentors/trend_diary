import { toJaDateString } from './date'

describe('Date Utils', () => {
  describe('toJaDateString', () => {
    describe('文字列で日付が渡された場合', () => {
      it('文字列の日付が日本語形式で正しくフォーマットされること', () => {
        const date = '2024-01-01T00:00:00Z'
        const formatted = toJaDateString(date)

        expect(formatted).toBe('2024/1/1')
      })
      it('無効な日付文字列の場合、空文字を返すこと', () => {
        const date = 'invalid-date-string'
        const formatted = toJaDateString(date)

        expect(formatted).toBe('')
      })
    })
    describe('Dateオブジェクトで日付が渡された場合', () => {
      it('Dateの日付が日本語形式で正しくフォーマットされること', () => {
        const date = new Date('2024-01-01T00:00:00Z')
        const formatted = toJaDateString(date)

        expect(formatted).toBe('2024/1/1')
      })

      it('無効なDateオブジェクトの場合、空文字を返すこと', () => {
        const date = new Date('invalid-date-string')
        const formatted = toJaDateString(date)

        expect(formatted).toBe('')
      })
    })
  })
})
