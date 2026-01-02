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

// createSupabaseAuthClientはモックして何も返さない（使われないため）
vi.mock('@/infrastructure/supabase', () => ({
  createSupabaseAuthClient: () => ({}),
}))

describe('GET /api/v2/auth/me', () => {
  const TEST_EMAIL = 'me-test@example.com'
  const TEST_PASSWORD = 'test_password123'

  beforeEach(async () => {
    mockRepository.clearAll()
    mockActiveUsers.clear()
    activeUserIdCounter = 1n
  })

  async function requestMe() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    return app.request(
      '/api/v2/auth/me',
      {
        method: 'GET',
        headers,
      },
      TEST_ENV,
    )
  }

  it('正常系: 現在のユーザー情報を取得できる', async () => {
    // ユーザーを作成してログイン状態にする
    const signupResult = await mockRepository.signup(TEST_EMAIL, TEST_PASSWORD)
    if (isSuccess(signupResult)) {
      // signup時のauthenticationIdでActiveUserを作成
      createMockActiveUser(TEST_EMAIL, signupResult.data.user.id)
    }

    // ユーザー情報取得
    const meRes = await requestMe()
    expect(meRes.status).toBe(200)

    const body = (await meRes.json()) as { user: { displayName: string | null } }
    expect(body).toHaveProperty('user')
    expect(body.user).toHaveProperty('displayName')
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
