import { isSuccess, success } from '@yuukihayashi0510/core'
import { vi } from 'vitest'
import { MockAuthV2Repository } from '@/application/api/v2/auth/mock/mockAuthV2Repository'
import type { Command, Query } from '@/domain/user/repository'
import type { ActiveUser } from '@/domain/user/schema/active-user-schema'
import getRdbClient, { RdbClient } from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'

// モックリポジトリのシングルトンインスタンス
export const mockRepository = new MockAuthV2Repository()

// ログイン時に作成されたユーザーを保存するMap（authenticationId -> ActiveUser）
export const mockActiveUsers = new Map<string, ActiveUser>()

// RDBクライアント
let rdb: RdbClient | null = null

function getRdb(): RdbClient {
  if (!rdb) {
    rdb = getRdbClient(TEST_ENV.DATABASE_URL)
  }
  return rdb
}

// モックのActiveUser生成関数（実DBにも作成）
async function createMockActiveUser(
  email: string,
  mockAuthenticationId: string,
): Promise<ActiveUser> {
  const db = getRdb()

  // 実際のDBにユーザーを作成
  const user = await db.user.create({
    data: {},
  })

  // DB用のUUIDを生成（モックのauthenticationIdはUUID形式ではないため）
  const dbAuthenticationId = crypto.randomUUID()

  const activeUser = await db.activeUser.create({
    data: {
      userId: user.userId,
      email,
      password: 'SUPABASE_AUTH_USER',
      displayName: null,
      authenticationId: dbAuthenticationId,
    },
  })

  const result: ActiveUser = {
    activeUserId: activeUser.activeUserId,
    userId: user.userId,
    email: activeUser.email,
    password: activeUser.password,
    displayName: activeUser.displayName,
    authenticationId: activeUser.authenticationId ?? undefined,
    lastLogin: activeUser.lastLogin ?? undefined,
    createdAt: activeUser.createdAt,
    updatedAt: activeUser.updatedAt,
  }

  // モックユーザーをMapに保存（モックのauthenticationIdをキーにする）
  mockActiveUsers.set(mockAuthenticationId, result)
  return result
}

// モックのQuery
export const mockQuery: Query = {
  findActiveById: vi.fn(),
  findActiveByEmail: vi.fn(),
  findActiveByEmailForAuth: vi.fn(),
  findActiveByAuthenticationId: vi.fn((authenticationId: string) => {
    const activeUser = mockActiveUsers.get(authenticationId)
    return Promise.resolve(success(activeUser || null))
  }),
}

// モックのCommand
export const mockCommand: Command = {
  createActive: vi.fn(),
  createActiveWithAuthenticationId: vi.fn(
    async (email: string, _password: string, authenticationId: string) => {
      const activeUser = await createMockActiveUser(email, authenticationId)
      return success(activeUser)
    },
  ),
  saveActive: vi.fn(),
}

type CreateResult = {
  activeUserId: bigint
  authenticationId: string
}

type LoginResult = {
  activeUserId: bigint
  accessToken: string
}

const userTestHelper = {
  /**
   * テスト用ユーザーを作成する
   */
  async create(email: string, password: string): Promise<CreateResult> {
    const signupResult = await mockRepository.signup(email, password)
    if (!isSuccess(signupResult)) {
      throw new Error(`Failed to create user: ${signupResult.error.message}`)
    }

    const authenticationId = signupResult.data.user.id
    const activeUser = await createMockActiveUser(email, authenticationId)

    return {
      activeUserId: activeUser.activeUserId,
      authenticationId,
    }
  },

  /**
   * ログインしてセッション情報を取得する
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const loginResult = await mockRepository.login(email, password)
    if (!isSuccess(loginResult)) {
      throw new Error(`Failed to login: ${loginResult.error.message}`)
    }

    const authenticationId = loginResult.data.user.id
    const activeUser = mockActiveUsers.get(authenticationId)

    if (!activeUser) {
      throw new Error(`ActiveUser not found for authenticationId: ${authenticationId}`)
    }

    return {
      activeUserId: activeUser.activeUserId,
      accessToken: loginResult.data.session.accessToken,
    }
  },

  /**
   * テストデータをクリーンアップする（DBのデータも削除）
   */
  async cleanUp(): Promise<void> {
    const db = getRdb()
    // 関連テーブルを削除（外部キー制約の順序に注意）
    await db.$queryRaw`TRUNCATE TABLE read_histories, sessions, active_users, leaved_users, banned_users, users RESTART IDENTITY CASCADE;`
    mockRepository.clearAll()
    mockActiveUsers.clear()
  },
}

export default userTestHelper
