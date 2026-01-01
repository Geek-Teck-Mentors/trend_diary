import { isSuccess, success } from '@yuukihayashi0510/core'
import { vi } from 'vitest'
import type { Command, Query } from '@/domain/user/repository'
import type { ActiveUser } from '@/domain/user/schema/active-user-schema'
import { MockAuthV2Repository } from '@/test/__mocks__/mockAuthV2Repository'
import TEST_ENV from '@/test/env'
import app from '../../../../server'

const mockRepository = new MockAuthV2Repository()

// ログイン時に作成されたユーザーを保存するMap（authenticationId -> ActiveUser）
const mockActiveUsers = new Map<string, ActiveUser>()

// モックのActiveUser生成関数
let activeUserIdCounter = 1n
function createMockActiveUser(email: string, authenticationId: string): ActiveUser {
  const activeUser: ActiveUser = {
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
  // モックユーザーをMapに保存
  mockActiveUsers.set(authenticationId, activeUser)
  return activeUser
}

// モックのQuery
const mockQuery: Query = {
  findActiveById: vi.fn(),
  findActiveByEmail: vi.fn(),
  findActiveByEmailForAuth: vi.fn(),
  findActiveByAuthenticationId: vi.fn((authenticationId: string) => {
    const activeUser = mockActiveUsers.get(authenticationId)
    return Promise.resolve(success(activeUser || null))
  }),
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

// QueryImplをモック
vi.mock('@/domain/user/infrastructure/query-impl', () => ({
  default: vi.fn(() => mockQuery),
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

describe('POST /api/v2/auth/login', () => {
  const TEST_EMAIL = 'login-test@example.com'
  const TEST_PASSWORD = 'Test@password123'

  beforeEach(async () => {
    mockRepository.clearAll()
    mockActiveUsers.clear()
    activeUserIdCounter = 1n
    // テスト用ユーザーを作成
    const signupResult = await mockRepository.signup(TEST_EMAIL, TEST_PASSWORD)
    if (isSuccess(signupResult)) {
      // signup時のauthenticationIdでActiveUserを作成
      createMockActiveUser(TEST_EMAIL, signupResult.data.user.id)
    }
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
    const body = (await res.json()) as { displayName: string | null }
    expect(body).toHaveProperty('displayName')
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
      {
        name: 'パスワードが間違っている',
        input: { email: TEST_EMAIL, password: 'Wrong@password123' },
        status: 401,
      },
      {
        name: '存在しないユーザー',
        input: { email: 'nonexistent@example.com', password: 'Test@password123' },
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
