import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import app from '@/application/server'
import type { ActiveUser } from '@/domain/user/schema/active-user-schema'
import getRdbClient, { RdbClient } from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'

// Supabaseクライアント
let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(TEST_ENV.SUPABASE_URL, TEST_ENV.SUPABASE_ANON_KEY)
  }
  return supabase
}

// RDBクライアント
let rdb: RdbClient | null = null

function getRdb(): RdbClient {
  if (!rdb) {
    rdb = getRdbClient(TEST_ENV.DATABASE_URL)
  }
  return rdb
}

// 作成したユーザーを追跡（クリーンアップ用）
const createdUserIds: bigint[] = []
const createdAuthIds: string[] = []

// ActiveUser生成関数（実DBに作成）
async function createActiveUser(email: string, authenticationId: string): Promise<ActiveUser> {
  const db = getRdb()

  // 実際のDBにユーザーを作成
  const user = await db.user.create({
    data: {},
  })

  const activeUser = await db.activeUser.create({
    data: {
      userId: user.userId,
      email,
      password: 'SUPABASE_AUTH_USER',
      displayName: null,
      authenticationId,
    },
  })

  // 追跡用に保存
  createdUserIds.push(user.userId)

  return {
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
}

type CreateResult = {
  activeUserId: bigint
  authenticationId: string
}

type LoginResult = {
  activeUserId: bigint
  cookies: string
}

const userTestHelper = {
  /**
   * テスト用ユーザーを作成する（Supabase Auth + DB）
   */
  async create(email: string, password: string): Promise<CreateResult> {
    const client = getSupabase()

    const { data, error } = await client.auth.signUp({ email, password })
    if (error || !data.user) {
      throw new Error(`Failed to create user: ${error?.message ?? 'Unknown error'}`)
    }

    const authenticationId = data.user.id
    createdAuthIds.push(authenticationId)

    const activeUser = await createActiveUser(email, authenticationId)

    // signUp後はログアウトして初期状態にする
    await client.auth.signOut()

    return {
      activeUserId: activeUser.activeUserId,
      authenticationId,
    }
  },

  /**
   * Hono経由でログインしてセッション情報を取得する
   * Set-Cookieヘッダーも返すので、後続のリクエストに使用できる
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const db = getRdb()

    // Hono経由でログイン
    const res = await app.request(
      '/api/v2/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      TEST_ENV,
    )

    if (res.status !== 200) {
      throw new Error(`Failed to login: ${res.status}`)
    }

    // Set-Cookieヘッダーを取得
    const setCookieHeaders = res.headers.getSetCookie()
    const cookies = setCookieHeaders.map((cookie) => cookie.split(';')[0]).join('; ')

    // DBからActiveUserを取得
    const activeUser = await db.activeUser.findFirst({
      where: { email },
    })

    if (!activeUser) {
      throw new Error(`ActiveUser not found for email: ${email}`)
    }

    return {
      activeUserId: activeUser.activeUserId,
      cookies,
    }
  },

  /**
   * ログアウトする
   */
  async logout(): Promise<void> {
    const client = getSupabase()
    await client.auth.signOut()
  },

  /**
   * テストデータをクリーンアップする（作成したレコードのみ削除）
   */
  async cleanUp(): Promise<void> {
    const db = getRdb()

    // ログアウト
    const client = getSupabase()
    await client.auth.signOut()

    // DBのユーザーをバッチ削除
    if (createdUserIds.length > 0) {
      await db.activeUser.deleteMany({ where: { userId: { in: createdUserIds } } })
      await db.user.deleteMany({ where: { userId: { in: createdUserIds } } })
      createdUserIds.length = 0
    }

    // Supabase Authのユーザーをバッチ削除
    if (createdAuthIds.length > 0) {
      await db.$queryRaw`DELETE FROM auth.users WHERE id = ANY(${createdAuthIds}::uuid[])`
      createdAuthIds.length = 0
    }
  },

  /**
   * テスト用メールパターンのユーザーを全て削除する（APIテスト用）
   * signup API などで直接作成されたユーザーもクリーンアップ可能
   */
  async cleanUpByEmailPattern(emailPattern: string): Promise<void> {
    const db = getRdb()

    // DBのユーザーを削除
    const activeUsers = await db.activeUser.findMany({
      where: { email: { contains: emailPattern } },
      select: { userId: true, authenticationId: true },
    })

    if (activeUsers.length > 0) {
      const userIds = activeUsers.map((u) => u.userId)
      const authIds = activeUsers.map((u) => u.authenticationId).filter((id): id is string => !!id)

      await db.activeUser.deleteMany({ where: { userId: { in: userIds } } })
      await db.user.deleteMany({ where: { userId: { in: userIds } } })

      // Supabase Authのユーザーも削除
      if (authIds.length > 0) {
        await db.$queryRaw`DELETE FROM auth.users WHERE id = ANY(${authIds}::uuid[])`
      }
    }

    // auth.users に直接存在するユーザーも削除（ActiveUserがない場合）
    await db.$queryRaw`DELETE FROM auth.users WHERE email LIKE ${`%${emailPattern}%`}`
  },
}

export default userTestHelper
