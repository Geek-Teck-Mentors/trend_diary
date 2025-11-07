import { success } from '@yuukihayashi0510/core'
import { vi } from 'vitest'
import { AuthV2UseCase } from '@/domain/auth-v2'
import type { Command, Query } from '@/domain/user/repository'
import type { ActiveUser } from '@/domain/user/schema/activeUserSchema'
import TEST_ENV from '@/test/env'
import { MockAuthV2Repository } from '@/test/mocks/mockAuthV2Repository'
import app from '../../../server'

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
  findActiveByAuthenticationId: vi.fn(() => {
    return Promise.resolve(success(null))
  }),
}

// createAuthV2UseCaseをモックする
vi.mock('@/domain/auth-v2', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/domain/auth-v2')>()
  return {
    ...mod,
    createAuthV2UseCase: () => new AuthV2UseCase(mockRepository, mockQuery, mockCommand),
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

describe('POST /api/v2/auth/login', () => {
  const TEST_EMAIL = 'login-test@example.com'
  const TEST_PASSWORD = 'test_password123'

  beforeEach(async () => {
    mockRepository.clearAll()
    // テスト用ユーザーを作成
    await mockRepository.signup(TEST_EMAIL, TEST_PASSWORD)
    // ログアウトして初期状態に戻す
    await mockRepository.logout()
  })

  async function requestLogin(body: string) {
    return app.request(
      '/api/v2/auth/login',
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

  it('正常系: ログインに成功する', async () => {
    const res = await requestLogin(JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }))

    expect(res.status).toBe(200)
    const body = (await res.json()) as { user: { id: string; email: string } }
    expect(body).toHaveProperty('user')
    expect(body.user).toHaveProperty('id')
    expect(body.user).toHaveProperty('email', TEST_EMAIL)
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
      {
        name: 'パスワードが間違っている',
        input: { email: TEST_EMAIL, password: 'wrong_password123' },
        status: 401,
      },
      {
        name: '存在しないユーザー',
        input: { email: 'nonexistent@example.com', password: 'test_password123' },
        status: 401,
      },
    ]

    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        const res = await requestLogin(JSON.stringify(testCase.input))
        expect(res.status).toBe(testCase.status)
      })
    })
  })
})
