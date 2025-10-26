import TEST_ENV from '@/test/env'
import supabaseAuthTestHelper from '@/test/helper/supabaseAuthTestHelper'
import app from '../../server'

describe('DELETE /api/supabase-auth/logout', () => {
  const TEST_EMAIL = 'logout-test@example.com'
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

  async function requestLogout(cookieHeader?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (cookieHeader) {
      headers.Cookie = cookieHeader
    }

    return app.request(
      '/api/supabase-auth/logout',
      {
        method: 'DELETE',
        headers,
      },
      TEST_ENV,
    )
  }

  it('正常系: ログアウトに成功する', async () => {
    // まずログイン
    const loginRes = await requestLogin()
    expect(loginRes.status).toBe(200)

    // ログインレスポンスからcookieを取得
    const cookies = loginRes.headers.getSetCookie()
    const cookieHeader = cookies.join('; ')

    // ログアウト
    const logoutRes = await requestLogout(cookieHeader)
    expect(logoutRes.status).toBe(204)

    // cookieがクリアされていることを確認
    const logoutCookies = logoutRes.headers.getSetCookie()
    expect(logoutCookies.length).toBeGreaterThan(0)
    const hasClearedCookie = logoutCookies.some(
      (cookie) => cookie.includes('sb-') && cookie.includes('Max-Age=0'),
    )
    expect(hasClearedCookie).toBe(true)
  })

  it('準正常系: ログインしていない状態でもエラーにならない', async () => {
    const res = await requestLogout()
    // ログインしていなくても204を返す（冪等性）
    expect(res.status).toBe(204)
  })
})
