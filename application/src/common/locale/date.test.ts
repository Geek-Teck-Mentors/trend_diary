import { addJstDays, toJaDateString, toJstDateString } from './date'

describe('Common Date Module', () => {
  describe('toJaDateString', () => {
    const testCases = [
      {
        name: '文字列の日付が日本語形式で正しくフォーマットされること',
        input: '2024-01-01T00:00:00Z',
        expected: '2024/1/1',
      },
      {
        name: '無効な日付文字列の場合、空文字を返すこと',
        input: 'invalid-date-string',
        expected: '',
      },
      {
        name: 'Dateの日付が日本語形式で正しくフォーマットされること',
        input: new Date('2024-01-01T00:00:00Z'),
        expected: '2024/1/1',
      },
      {
        name: '無効なDateオブジェクトの場合、空文字を返すこと',
        input: new Date('invalid-date-string'),
        expected: '',
      },
    ]

    testCases.forEach(({ name, input, expected }) => {
      it(name, () => {
        const result = toJaDateString(input)
        expect(result).toBe(expected)
      })
    })
  })

  describe('toJstDateString', () => {
    it('DateをJSTのYYYY-MM-DD形式に変換できること', () => {
      const result = toJstDateString(new Date('2024-01-01T00:00:00Z'))
      expect(result).toBe('2024-01-01')
    })

    it('無効なDateの場合はエラーになること', () => {
      expect(() => toJstDateString(new Date('invalid-date'))).toThrow('無効な日付です')
    })
  })

  describe('addJstDays', () => {
    it('JST基準で日付加算できること', () => {
      const result = addJstDays('2024-01-01', -1)
      expect(result).toBe('2023-12-31')
    })

    it('不正な日付文字列の場合はエラーになること', () => {
      expect(() => addJstDays('invalid', 1)).toThrow('不正な日付文字列です')
    })
  })
})
