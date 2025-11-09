import { describe, expect, test } from 'vitest'
import { isLoggedIn } from './user-status'

describe('userStatus', () => {
  describe('isLoggedIn', () => {
    test('通常のユーザー名の場合、trueを返す', () => {
      expect(isLoggedIn('山田太郎')).toBe(true)
      expect(isLoggedIn('user123')).toBe(true)
      expect(isLoggedIn('テストユーザー')).toBe(true)
    })

    test('空文字列の場合、falseを返す', () => {
      expect(isLoggedIn('')).toBe(false)
    })

    test('空白文字のみの場合、falseを返す', () => {
      expect(isLoggedIn('   ')).toBe(false)
      expect(isLoggedIn('\t')).toBe(false)
      expect(isLoggedIn('\n')).toBe(false)
    })

    test('前後に空白がある場合でも、中身があればtrueを返す', () => {
      expect(isLoggedIn('  山田太郎  ')).toBe(true)
    })
  })
})
