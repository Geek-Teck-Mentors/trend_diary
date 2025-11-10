import TEST_ENV from '@/test/env'
import activeUserTestHelper from '@/test/helper/activeUserTestHelper'
import app from '../route'

describe('POST /', () => {
  beforeAll(async () => {
    await activeUserTestHelper.cleanUp()
  })

  afterAll(async () => {
    await activeUserTestHelper.cleanUp()
    await activeUserTestHelper.disconnect()
  })

  async function requestShort(body: string) {
    return app.request(
      '/',
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

  it('正常系', async () => {
    const res = await requestShort(
      JSON.stringify({ email: 'signup@test.com', password: 'test_password' }),
    )

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toEqual({})
  })

  describe('準正常系', async () => {
    const testCases: Array<{
      name: string
      input: string | { email: string; password: string }
      status: number
    }> = [
      {
        name: '不正なメールアドレス',
        input: { email: 'invalid-email', password: 'test_password' },
        status: 422,
      },
      {
        name: '不正なパスワード',
        input: { email: 'test@test.com', password: 'abc' },
        status: 422,
      },
    ]

    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        const res = await requestShort(JSON.stringify(testCase.input))
        expect(res.status).toBe(testCase.status)
      })
    })

    it('既に存在するメールアドレスの場合', async () => {
      const email = 'test@example.com'

      // 1回目の登録
      const res1 = await requestShort(JSON.stringify({ email, password: 'test_password' }))
      expect(res1.status).toBe(201)

      // 2回目の登録
      const res2 = await requestShort(JSON.stringify({ email, password: 'test_password' }))
      expect(res2.status).toBe(409)
    })
  })
})
