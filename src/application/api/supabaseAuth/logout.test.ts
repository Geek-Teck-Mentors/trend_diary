import { vi } from 'vitest'
import { SupabaseAuthenticationUseCase } from '@/domain/supabaseAuth'
import TEST_ENV from '@/test/env'
import { MockSupabaseAuthenticationRepository } from '@/test/mocks/mockSupabaseAuthenticationRepository'
import app from '../../server'

const mockRepository = new MockSupabaseAuthenticationRepository()

// createSupabaseAuthenticationUseCaseをモックする
vi.mock('@/domain/supabaseAuth', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/domain/supabaseAuth')>()
  return {
    ...mod,
    createSupabaseAuthenticationUseCase: () => new SupabaseAuthenticationUseCase(mockRepository),
  }
})

// createSupabaseAuthClientはモックして何も返さない（使われないため）
vi.mock('@/infrastructure/supabase', () => ({
  createSupabaseAuthClient: () => ({}),
}))

describe('DELETE /api/supabase-auth/logout', () => {
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
      '/api/supabase-auth/logout',
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
