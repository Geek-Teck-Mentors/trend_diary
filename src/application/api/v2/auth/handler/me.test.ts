import TEST_ENV from '@/test/env'
import type { CleanUpIds } from '@/test/helper/user'
import * as userHelper from '@/test/helper/user'
import app from '../../../../server'

describe('GET /api/v2/auth/me', () => {
  const TEST_EMAIL = 'me-test@example.com'
  const TEST_PASSWORD = 'Test@password123'
  const createdIds: CleanUpIds = { userIds: [], authIds: [] }

  beforeEach(async () => {
    await userHelper.cleanUp(createdIds)
    createdIds.userIds.length = 0
    createdIds.authIds.length = 0
  })

  afterAll(async () => {
    await userHelper.cleanUp(createdIds)
  })

  async function requestMe(cookies?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (cookies) {
      headers.Cookie = cookies
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
    const { userId, authenticationId } = await userHelper.create(TEST_EMAIL, TEST_PASSWORD)
    createdIds.userIds.push(userId)
    createdIds.authIds.push(authenticationId)

    const { cookies } = await userHelper.login(TEST_EMAIL, TEST_PASSWORD)

    // ユーザー情報取得（クッキーを渡す）
    const meRes = await requestMe(cookies)
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
    const { userId, authenticationId } = await userHelper.create(TEST_EMAIL, TEST_PASSWORD)
    createdIds.userIds.push(userId)
    createdIds.authIds.push(authenticationId)

    await userHelper.login(TEST_EMAIL, TEST_PASSWORD)

    // ログアウト（クッキーなしでリクエスト）
    const res = await requestMe()
    expect(res.status).toBe(401)
  })
})
