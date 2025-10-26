import TEST_ENV from '@/test/env'
import supabaseAuthTestHelper from '@/test/helper/supabaseAuthTestHelper'
import app from '../../server'

describe('POST /api/supabase-auth/signup', () => {
  beforeAll(async () => {
    await supabaseAuthTestHelper.cleanUp()
  })

  afterAll(async () => {
    await supabaseAuthTestHelper.cleanUp()
  })

  async function requestSignup(body: string) {
    return app.request(
      '/api/supabase-auth/signup',
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

  it('正常系: signupが成功する', async () => {
    const res = await requestSignup(
      JSON.stringify({ email: 'signup@test.com', password: 'test_password123' }),
    )

    expect(res.status).toBe(201)
    const body = (await res.json()) as { user: { id: string; email: string } }
    expect(body).toHaveProperty('user')
    expect(body.user).toHaveProperty('id')
    expect(body.user).toHaveProperty('email', 'signup@test.com')
  })

  describe('準正常系', () => {
    const testCases: Array<{
      name: string
      input: string | { email: string; password: string }
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
    ]

    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        const res = await requestSignup(JSON.stringify(testCase.input))
        expect(res.status).toBe(testCase.status)
      })
    })

    it('既に存在するメールアドレスの場合', async () => {
      const email = 'duplicate@example.com'

      // 1回目の登録
      const res1 = await requestSignup(JSON.stringify({ email, password: 'test_password123' }))
      expect(res1.status).toBe(201)

      // 2回目の登録
      const res2 = await requestSignup(JSON.stringify({ email, password: 'test_password123' }))
      expect(res2.status).toBe(409)
    })
  })
})
