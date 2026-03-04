import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { ActiveUser } from '@/domain/user/schema/active-user-schema'
import TEST_ENV from '@/test/env'
import app from '@/web/server'
import { getTestRdb } from './rdb'

function canDeleteSupabaseUsersViaSql(): boolean {
  return TEST_ENV.DATABASE_URL.startsWith('postgresql://')
}

// Supabaseクライアント
let supabase: SupabaseClient | null = null
let supabaseAdmin: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(TEST_ENV.SUPABASE_URL, TEST_ENV.SUPABASE_ANON_KEY)
  }
  return supabase
}

function getSupabaseAdmin(): SupabaseClient | null {
  if (!TEST_ENV.SUPABASE_SERVICE_ROLE_KEY) return null
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(TEST_ENV.SUPABASE_URL, TEST_ENV.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return supabaseAdmin
}

async function deleteAuthUsersByEmailPattern(emailPattern: string): Promise<void> {
  const admin = getSupabaseAdmin()
  if (!admin) return

  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) break

    const matchedIds = data.users
      .filter((user) => (user.email ?? '').includes(emailPattern))
      .map((user) => user.id)

    await Promise.all(matchedIds.map((id) => admin.auth.admin.deleteUser(id)))

    if (data.users.length < perPage) break
    page += 1
  }
}

// ActiveUser生成関数（実DBに作成）
async function createActiveUser(email: string, authenticationId: string): Promise<ActiveUser> {
  const db = getTestRdb()
  const lastUser = await db.user.findFirst({
    orderBy: { userId: 'desc' },
    select: { userId: true },
  })
  const lastActiveUser = await db.activeUser.findFirst({
    orderBy: { activeUserId: 'desc' },
    select: { activeUserId: true },
  })

  // 実際のDBにユーザーを作成
  const user = await db.user.create({
    data: {
      userId: (lastUser?.userId ?? 0n) + 1n,
    },
  })

  const activeUser = await db.activeUser.create({
    data: {
      activeUserId: (lastActiveUser?.activeUserId ?? 0n) + 1n,
      userId: user.userId,
      email,
      displayName: null,
      authenticationId,
    },
  })

  return {
    activeUserId: activeUser.activeUserId,
    userId: user.userId,
    email: activeUser.email,
    displayName: activeUser.displayName,
    authenticationId: activeUser.authenticationId ?? undefined,
    createdAt: activeUser.createdAt,
    updatedAt: activeUser.updatedAt,
  }
}

export type CreateResult = {
  activeUserId: bigint
  userId: bigint
  authenticationId: string
}

export type LoginResult = {
  activeUserId: bigint
  cookies: string
}

export type CleanUpIds = {
  userIds: bigint[]
  authIds: string[]
}

/**
 * テスト用ユーザーを作成する（Supabase Auth + DB）
 */
export async function create(email: string, password: string): Promise<CreateResult> {
  const client = getSupabase()
  const db = getTestRdb()

  const signUpResult = await client.auth.signUp({ email, password })

  let authenticationId: string
  if (signUpResult.error) {
    if (!signUpResult.error.message.includes('User already registered')) {
      throw new Error(`Failed to create user: ${signUpResult.error.message}`)
    }

    const signInResult = await client.auth.signInWithPassword({ email, password })
    if (signInResult.error || !signInResult.data.user) {
      throw new Error(`Failed to create user: ${signInResult.error?.message ?? 'Unknown error'}`)
    }
    authenticationId = signInResult.data.user.id
  } else if (signUpResult.data.user) {
    authenticationId = signUpResult.data.user.id
  } else {
    throw new Error('Failed to create user: Unknown error')
  }

  const existingActiveUser = await db.activeUser.findFirst({
    where: { authenticationId },
    select: { activeUserId: true, userId: true },
  })

  const activeUser = existingActiveUser
    ? {
        activeUserId: existingActiveUser.activeUserId,
        userId: existingActiveUser.userId,
      }
    : await createActiveUser(email, authenticationId)

  // signUp後はログアウトして初期状態にする
  await client.auth.signOut()

  return {
    activeUserId: activeUser.activeUserId,
    userId: activeUser.userId,
    authenticationId,
  }
}

/**
 * Hono経由でログインしてセッション情報を取得する
 * Set-Cookieヘッダーも返すので、後続のリクエストに使用できる
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  const db = getTestRdb()

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
}

/**
 * ログアウトする
 */
export async function logout(): Promise<void> {
  const client = getSupabase()
  await client.auth.signOut()
}

/**
 * テストデータをクリーンアップする（指定したIDのみ削除）
 */
export async function cleanUp(ids: CleanUpIds): Promise<void> {
  const db = getTestRdb()

  // ログアウト
  const client = getSupabase()
  await client.auth.signOut()

  // DBのユーザーをバッチ削除
  if (ids.userIds.length > 0) {
    await db.activeUser.deleteMany({ where: { userId: { in: ids.userIds } } })
    await db.user.deleteMany({ where: { userId: { in: ids.userIds } } })
  }

  // Supabase Authのユーザーをバッチ削除
  if (ids.authIds.length > 0 && canDeleteSupabaseUsersViaSql()) {
    await db.$queryRaw`DELETE FROM auth.users WHERE id = ANY(${ids.authIds}::uuid[])`
  } else if (ids.authIds.length > 0) {
    const admin = getSupabaseAdmin()
    if (admin) {
      await Promise.all(ids.authIds.map((id) => admin.auth.admin.deleteUser(id)))
    }
  }
}

/**
 * テスト用メールパターンのユーザーを全て削除する（APIテスト用）
 * signup API などで直接作成されたユーザーもクリーンアップ可能
 */
export async function cleanUpByEmailPattern(emailPattern: string): Promise<void> {
  const db = getTestRdb()

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
    if (authIds.length > 0 && canDeleteSupabaseUsersViaSql()) {
      await db.$queryRaw`DELETE FROM auth.users WHERE id = ANY(${authIds}::uuid[])`
    } else if (authIds.length > 0) {
      const admin = getSupabaseAdmin()
      if (admin) {
        await Promise.all(authIds.map((id) => admin.auth.admin.deleteUser(id)))
      }
    }
  }

  // auth.users に直接存在するユーザーも削除（ActiveUserがない場合）
  if (canDeleteSupabaseUsersViaSql()) {
    await db.$queryRaw`DELETE FROM auth.users WHERE email LIKE ${`%${emailPattern}%`}`
  } else {
    await deleteAuthUsersByEmailPattern(emailPattern)
  }
}
