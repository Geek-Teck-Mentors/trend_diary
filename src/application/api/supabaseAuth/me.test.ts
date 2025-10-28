import { vi } from 'vitest'
import { SupabaseAuthUseCase } from '@/domain/supabaseAuth'
import TEST_ENV from '@/test/env'
import { MockSupabaseAuthRepository } from '@/test/mocks/mockSupabaseAuthRepository'
import app from '../../server'

const mockRepository = new MockSupabaseAuthRepository()

// createSupabaseAuthUseCaseをモックする
vi.mock('@/domain/supabaseAuth', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/domain/supabaseAuth')>()
  return {
    ...mod,
    createSupabaseAuthUseCase: () => new SupabaseAuthUseCase(mockRepository),
  }
})

// createSupabaseAuthClientはモックして何も返さない（使われないため）
vi.mock('@/infrastructure/supabase', () => ({
  createSupabaseAuthClient: () => ({}),
}))

describe('GET /api/supabase-auth/me', () => {
  const TEST_EMAIL = 'me-test@example.com'
  const TEST_PASSWORD = 'test_password123'

  beforeEach(async () => {
    mockRepository.clearAll()
  })

  async function requestMe() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    return app.request(
      '/api/supabase-auth/me',
      {
        method: 'GET',
        headers,
      },
      TEST_ENV,
    )
  }

  it('正常系: 現在のユーザー情報を取得できる', async () => {
    // ユーザーを作成してログイン状態にする
    await mockRepository.signup(TEST_EMAIL, TEST_PASSWORD)

    // ユーザー情報取得
    const meRes = await requestMe()
    expect(meRes.status).toBe(200)

    const body = (await meRes.json()) as { user: { id: string; email: string } }
    expect(body).toHaveProperty('user')
    expect(body.user).toHaveProperty('id')
    expect(body.user).toHaveProperty('email', TEST_EMAIL)
  })

  it('準正常系: ログインしていない場合は401を返す', async () => {
    const res = await requestMe()
    expect(res.status).toBe(401)
  })

  it('準正常系: ログアウト後は401を返す', async () => {
    // ユーザーを作成してログイン
    await mockRepository.signup(TEST_EMAIL, TEST_PASSWORD)

    // ログアウト
    await mockRepository.logout()

    const res = await requestMe()
    expect(res.status).toBe(401)
  })
})
