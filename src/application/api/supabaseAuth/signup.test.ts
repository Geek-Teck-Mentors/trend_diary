import { vi } from 'vitest'
import { success } from '@yuukihayashi0510/core'
import { SupabaseAuthenticationUseCase } from '@/domain/supabaseAuth'
import type { Command, Query } from '@/domain/user/repository'
import type { ActiveUser } from '@/domain/user/schema/activeUserSchema'
import TEST_ENV from '@/test/env'
import { MockSupabaseAuthenticationRepository } from '@/test/mocks/mockSupabaseAuthenticationRepository'
import app from '../../server'

const mockRepository = new MockSupabaseAuthenticationRepository()

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
    adminUserId: null,
  }
}

// モックのCommand
const mockCommand: Command = {
  createActive: vi.fn(),
  createActiveWithAuthenticationId: vi.fn((email, _password, authenticationId) => {
    return Promise.resolve(success(createMockActiveUser(email, authenticationId)))
  }),
  saveActive: vi.fn(),
  createSession: vi.fn(),
  deleteSession: vi.fn(),
}

// モックのQuery
const mockQuery: Query = {
  findActiveById: vi.fn(),
  findActiveByEmail: vi.fn(),
  findActiveBySessionId: vi.fn(),
  findActiveByAuthenticationId: vi.fn((authenticationId) => {
    return Promise.resolve(success(null))
  }),
}

// createSupabaseAuthenticationUseCaseをモックする
vi.mock('@/domain/supabaseAuth', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/domain/supabaseAuth')>()
  return {
    ...mod,
    createSupabaseAuthenticationUseCase: () =>
      new SupabaseAuthenticationUseCase(mockRepository, mockQuery, mockCommand),
  }
})

// getRdbClientをモックして何も返さない（使われないため）
vi.mock('@/infrastructure/rdb', () => ({
  default: () => ({}),
}))

// createSupabaseAuthClientはモックして何も返さない（使われないため）
vi.mock('@/infrastructure/supabase', () => ({
  createSupabaseAuthClient: () => ({}),
}))

describe('POST /api/supabase-auth/signup', () => {
  beforeEach(() => {
    mockRepository.clearAll()
  })

  async function requestSignup(body: string) {
    return app.request(
      '/api/supabase-auth/signup',
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
      JSON.stringify({ email: 'signup@test.com', password: 'test_password123' }),
    )

    expect(res.status).toBe(201)
    const body = (await res.json()) as { user: { id: string; email: string } }
    expect(body).toHaveProperty('user')
    expect(body.user).toHaveProperty('id')
    expect(body.user).toHaveProperty('email', 'signup@test.com')
  })

  describe('準正常系', () => {
    const testCases: Array<{
      name: string
      input: { email: string; password: string }
      status: number
    }> = [
      {
        name: '不正なメールアドレス',
        input: { email: 'invalid-email', password: 'test_password123' },
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
      const res1 = await requestSignup(JSON.stringify({ email, password: 'test_password123' }))
      expect(res1.status).toBe(201)

      // 2回目の登録
      const res2 = await requestSignup(JSON.stringify({ email, password: 'test_password123' }))
      expect(res2.status).toBe(409)
    })
  })
})
