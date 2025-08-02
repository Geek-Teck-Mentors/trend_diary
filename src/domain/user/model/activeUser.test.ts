import { describe, expect, it } from 'vitest'
import ActiveUser from './activeUser'

describe('ActiveUser ドメインモデル', () => {
  describe('recordLogin', () => {
    it('ログイン記録を更新できる', async () => {
      const now = new Date()
      const activeUser = new ActiveUser(
        1n,
        2n,
        'test@example.com',
        'hashedPassword123',
        'テストユーザー',
        now,
        now,
        now,
      )

      const beforeLogin = Date.now()
      // 少し待ってから実行
      await new Promise((resolve) => setTimeout(resolve, 2))
      activeUser.recordLogin()

      expect(activeUser.lastLogin?.getTime()).toBeGreaterThan(beforeLogin)
      expect(activeUser.lastLogin).toBeInstanceOf(Date)
    })
  })
})
