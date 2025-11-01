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
const mockActiveUsers = new Map<string, ActiveUser>()

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
    const activeUser = createMockActiveUser(email, authenticationId)
    mockActiveUsers.set(authenticationId, activeUser)
    return Promise.resolve(success(activeUser))
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
    const activeUser = mockActiveUsers.get(authenticationId) || null
    return Promise.resolve(success(activeUser))
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
