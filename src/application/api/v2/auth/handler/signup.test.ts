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

// getRdbClientをモックして何も返さない（使われないため）
vi.mock('@/infrastructure/rdb', () => ({
  default: () => ({}),
}))

// createSupabaseAuthClientはモックして何も返さない（使われないため）
vi.mock('@/infrastructure/supabase', () => ({
  createSupabaseAuthClient: () => ({}),
}))

describe('POST /api/v2/auth/signup', () => {
  beforeEach(() => {
    mockRepository.clearAll()
  })

  async function requestSignup(body: string) {
    return app.request(
      '/api/v2/auth/signup',
      {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
      },
      TEST_ENV,
    )
  }

  it('正常系: signupが成功する', async () => {
    const res = await requestSignup(
      JSON.stringify({ email: 'signup@test.com', password: 'Test@password123' }),
    )

    expect(res.status).toBe(201)
    const body = (await res.json()) as Record<string, never>
    expect(body).toEqual({})
  })

  describe('準正常系', () => {
    const testCases: Array<{
      name: string
      input: { email: string; password: string }
      status: number
    }> = [
      {
        name: '不正なメールアドレス',
        input: { email: 'invalid-email', password: 'Test@password123' },
        status: 422,
      },
      {
        name: '不正なパスワード（短すぎる）',
        input: { email: 'test@test.com', password: 'abc' },
        status: 422,
      },
    ]

    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        const res = await requestSignup(JSON.stringify(testCase.input))
        expect(res.status).toBe(testCase.status)
      })
    })

    it('既に存在するメールアドレスの場合', async () => {
      const email = 'duplicate@example.com'

      // 1回目の登録
      const res1 = await requestSignup(JSON.stringify({ email, password: 'Test@password123' }))
      expect(res1.status).toBe(201)

      // 2回目の登録
      const res2 = await requestSignup(JSON.stringify({ email, password: 'Test@password123' }))
      expect(res2.status).toBe(409)
    })
  })
})
