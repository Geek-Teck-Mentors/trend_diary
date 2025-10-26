import TEST_ENV from '@/test/env'
import supabaseAuthTestHelper from '@/test/helper/supabaseAuthTestHelper'
import app from '../../server'

describe('GET /api/supabase-auth/me', () => {
  const TEST_EMAIL = 'me-test@example.com'
  const TEST_PASSWORD = 'test_password123'

  beforeAll(async () => {
    await supabaseAuthTestHelper.cleanUp()
    // テスト用ユーザーを作成
    await supabaseAuthTestHelper.createUser(TEST_EMAIL, TEST_PASSWORD)
  })

  afterAll(async () => {
    await supabaseAuthTestHelper.cleanUp()
  })

  async function requestLogin() {
    return app.request(
      '/api/supabase-auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      TEST_ENV,
    )
  }

  async function requestMe(cookieHeader?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (cookieHeader) {
      headers.Cookie = cookieHeader
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
    // まずログイン
    const loginRes = await requestLogin()
    expect(loginRes.status).toBe(200)

    // ログインレスポンスからcookieを取得
    const cookies = loginRes.headers.getSetCookie()
    const cookieHeader = cookies.join('; ')

    // ユーザー情報取得
    const meRes = await requestMe(cookieHeader)
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

  it('準正常系: 無効なcookieの場合は401を返す', async () => {
    const res = await requestMe('sb-invalid-token=invalid')
    expect(res.status).toBe(401)
  })
})
