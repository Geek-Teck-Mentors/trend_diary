import { PrismaClient } from '@prisma/client'
import app from '@/application/server'
import TEST_ENV from '@/test/env'

const prisma = new PrismaClient({
  datasourceUrl: TEST_ENV.DATABASE_URL,
})

describe('POST /api/auth/logout', () => {
  const testEmail = 'logout@test.com'
  const testPassword = 'test_password'
  let accessToken: string

  beforeAll(async () => {
    await prisma.user.deleteMany({})

    // テストユーザーを作成
    await app.request(
      '/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({ email: testEmail, password: testPassword }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      TEST_ENV,
    )

    // ログインしてトークンを取得
    const loginRes = await app.request(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email: testEmail, password: testPassword }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      TEST_ENV,
    )
    const loginBody = (await loginRes.json()) as { accessToken: string; refreshToken: string }
    accessToken = loginBody.accessToken
  })

  afterAll(async () => {
    await prisma.user.deleteMany({})
    await prisma.$disconnect()
  })

  async function requestLogout(token?: string) {
    return app.request(
      '/api/auth/logout',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Cookie: `sb-access-token=${token}` } : {}),
        },
      },
      TEST_ENV,
    )
  }

  it('正常系: ログアウトができる', async () => {
    const res = await requestLogout(accessToken)

    expect(res.status).toBe(200)

    // Cookieが削除されることを確認
    const cookies = res.headers.get('Set-Cookie')
    expect(cookies).toBeDefined()
    expect(cookies).toContain('sb-access-token=;')
    expect(cookies).toContain('sb-refresh-token=;')
  })
})
