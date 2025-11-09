import { describe, expect, it } from 'vitest'
import type { ActiveUser } from './activeUserSchema'
import { recordLogin } from './method'

function makeActiveUser(overrides: Partial<ActiveUser> = {}): ActiveUser {
  const base: ActiveUser = {
    activeUserId: 1n,
    userId: 2n,
    email: 'test@example.com',
    password: 'password123',
    displayName: 'テストユーザー',
    authenticationId: null,
    // lastLogin は省略可能
    createdAt: new Date('2020-01-01T00:00:00Z'),
    updatedAt: new Date('2020-01-02T00:00:00Z'),
    adminUserId: null,
  }
  return { ...base, ...overrides }
}

describe('recordLogin', () => {
  it('最後にログインした日時を現在時刻に更新する', () => {
    const user = makeActiveUser()

    const before = new Date()
    const result = recordLogin(user)
    const after = new Date()

    expect(result.lastLogin).toBeInstanceOf(Date)
    const lastLoginTime = result.lastLogin!.getTime()
    expect(lastLoginTime).toBeGreaterThanOrEqual(before.getTime())
    expect(lastLoginTime).toBeLessThanOrEqual(after.getTime())

    // 他のプロパティは保持されていること
    expect(result.activeUserId).toEqual(user.activeUserId)
    expect(result.displayName).toEqual(user.displayName)
    expect(result.createdAt).toEqual(user.createdAt)
  })

  it('既存の lastLogin があれば上書きされる', () => {
    const oldDate = new Date('2021-01-01T00:00:00Z')
    const user = makeActiveUser({ lastLogin: oldDate })

    const result = recordLogin(user)

    expect(result.lastLogin).toBeInstanceOf(Date)
    expect(result.lastLogin).not.toEqual(oldDate)
  })
})
