import { PrismaClient } from '@prisma/client'
import app from '@/application/server'
import TEST_ENV from '@/test/env'

const prisma = new PrismaClient({
  datasourceUrl: TEST_ENV.DATABASE_URL,
})

describe('POST /api/auth/signup', () => {
  beforeAll(async () => {
    // テストユーザーのクリーンアップ
    await prisma.user.deleteMany({})
  })

  afterAll(async () => {
    await prisma.user.deleteMany({})
    await prisma.$disconnect()
  })

  async function requestSignup(body: string) {
    return app.request(
      '/api/auth/signup',
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

  it('正常系: ユーザー登録ができる', async () => {
    const res = await requestSignup(
      JSON.stringify({ email: 'signup@test.com', password: 'test_password' }),
    )

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toHaveProperty('userId')
    expect(body).toHaveProperty('supabaseId')
  })

  describe('準正常系', () => {
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
        const res = await requestSignup(JSON.stringify(testCase.input))
        expect(res.status).toBe(testCase.status)
      })
    })
  })
})
