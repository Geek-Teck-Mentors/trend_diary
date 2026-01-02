import TEST_ENV from '@/test/env'
import userTestHelper from '@/test/helper/user'
import app from '../../../../server'

describe('DELETE /api/v2/auth/logout', () => {
  const TEST_EMAIL = 'logout-test@example.com'
  const TEST_PASSWORD = 'Test@password123'

  beforeEach(async () => {
    await userTestHelper.cleanUp()
    // テスト用ユーザーを作成
    await userTestHelper.create(TEST_EMAIL, TEST_PASSWORD)
  })

  afterAll(async () => {
    await userTestHelper.cleanUp()
  })

  async function requestLogout() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    return app.request(
      '/api/v2/auth/logout',
      {
        method: 'DELETE',
        headers,
      },
      TEST_ENV,
    )
  }

  it('正常系: ログアウトに成功する', async () => {
    const res = await requestLogout()
    expect(res.status).toBe(204)
  })

  it('準正常系: ログインしていない状態でもエラーにならない', async () => {
    // ログアウト後に再度ログアウト
    await userTestHelper.logout()
    const res = await requestLogout()
    // ログインしていなくても204を返す（冪等性）
    expect(res.status).toBe(204)
  })
})
