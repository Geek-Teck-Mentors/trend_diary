import { success } from '@yuukihayashi0510/core'
import { vi } from 'vitest'
import type { Command } from '@/domain/user/repository'
import type { ActiveUser } from '@/domain/user/schema/active-user-schema'
import { MockAuthV2Repository } from '@/test/__mocks__/mockAuthV2Repository'
import TEST_ENV from '@/test/env'
import app from '../../../../server'

const mockRepository = new MockAuthV2Repository()

// モックのActiveUser生成関数
let activeUserIdCounter = 1n
function createMockActiveUser(email: string, authenticationId: string): ActiveUser {
  return {
    activeUserId: activeUserIdCounter++,
    userId: activeUserIdCounter,
    email,
    password: 'SUPABASE_AUTH_USER',
    displayName: null,
    authenticationId,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

// モックのCommand
const mockCommand: Command = {
  createActive: vi.fn(),
  createActiveWithAuthenticationId: vi.fn((email, _password, authenticationId) => {
    return Promise.resolve(success(createMockActiveUser(email, authenticationId)))
  }),
  saveActive: vi.fn(),
}

// SupabaseAuthRepositoryをモックして、MockAuthV2Repositoryを使う
vi.mock('@/domain/user/infrastructure/supabase-auth-repository', () => ({
  SupabaseAuthRepository: vi.fn(() => mockRepository),
}))

// CommandImplをモック
vi.mock('@/domain/user/infrastructure/command-impl', () => ({
  default: vi.fn(() => mockCommand),
}))

describe('DELETE /api/v2/auth/logout', () => {
  const TEST_EMAIL = 'logout-test@example.com'
  const TEST_PASSWORD = 'test_password123'

  beforeEach(async () => {
    mockRepository.clearAll()
    // テスト用ユーザーを作成してログイン
    await mockRepository.signup(TEST_EMAIL, TEST_PASSWORD)
  })

  async function requestLogout() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    return app.request(
      '/api/v2/auth/logout',
      {
        method: 'DELETE',
        headers,
      },
      TEST_ENV,
    )
  }

  it('正常系: ログアウトに成功する', async () => {
    const res = await requestLogout()
    expect(res.status).toBe(204)
  })

  it('準正常系: ログインしていない状態でもエラーにならない', async () => {
    // ログアウト後に再度ログアウト
    await mockRepository.logout()
    const res = await requestLogout()
    // ログインしていなくても204を返す（冪等性）
    expect(res.status).toBe(204)
  })
})
