import TEST_ENV from '@/test/env'
import supabaseAuthTestHelper from '@/test/helper/supabaseAuthTestHelper'
import app from '../../server'

describe('POST /api/supabase-auth/login', () => {
  const TEST_EMAIL = 'login-test@example.com'
  const TEST_PASSWORD = 'test_password123'

  beforeAll(async () => {
    await supabaseAuthTestHelper.cleanUp()
    // テスト用ユーザーを作成
    await supabaseAuthTestHelper.createUser(TEST_EMAIL, TEST_PASSWORD)
  })

  afterAll(async () => {
    await supabaseAuthTestHelper.cleanUp()
  })

  async function requestLogin(body: string) {
    return app.request(
      '/api/supabase-auth/login',
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

    // JWTがcookieに設定されていることを確認
    const setCookieHeaders = res.headers.getSetCookie()
    expect(setCookieHeaders.length).toBeGreaterThan(0)
    const hasAuthCookie = setCookieHeaders.some((cookie) => cookie.includes('sb-'))
    expect(hasAuthCookie).toBe(true)
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
