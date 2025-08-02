import { faker } from '@faker-js/faker'
import { SESSION_NAME } from '@/common/constants/session'
import { ActiveUserService } from '@/domain/user'
import TEST_ENV from '@/test/env'
import accountTestHelper from '@/test/helper/accountTestHelper'
import app from '../../server'

describe('DELETE /api/account/logout', () => {
  let setCookie: string[]

  const TEST_EMAIL = faker.internet.email()
  const TEST_PASSWORD = 'test_password'

  async function requestLogout() {
    return app.request(
      '/api/account/logout',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Cookie: setCookie.join('; '),
        },
      },
      TEST_ENV,
    )
  }

  beforeAll(() => {
    // accountTestHelperを使用
  })

  afterAll(async () => {
    await accountTestHelper.cleanUp()
    await accountTestHelper.disconnect()
  })

  beforeEach(async () => {
    await accountTestHelper.cleanUp()
    // モックをリセット
    vi.clearAllMocks()

    await accountTestHelper.create(TEST_EMAIL, TEST_PASSWORD)
    const body = JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })

    const res = await app.request(
      '/api/account/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      },
      TEST_ENV,
    )
    setCookie = res.headers.getSetCookie()
  })

  describe('正常系', () => {
    it('ログアウトに成功する', async () => {
      const res = await requestLogout()
      expect(res.status).toBe(204)
    })
  })

  describe('準正常系', () => {
    it('認証がない場合は401エラー', async () => {
      setCookie = []
      const res = await requestLogout()
      expect(res.status).toBe(401)
    })

    it('セッションが見つからない場合は401エラー', async () => {
      // 有効なセッションIDを含むCookieを作るが、DBからセッションを削除して存在しない状態にする
      const sessionCookie = setCookie.find((cookie) => cookie.startsWith(`${SESSION_NAME}=`))
      if (!sessionCookie) {
        throw new Error('セッションCookieが見つかりません')
      }

      // DBのセッションを削除
      await accountTestHelper.deleteAllSessions()

      // セッションが存在しないのでauthenticatorミドルウェアで401エラーになる
      const res = await requestLogout()

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data).toEqual({ message: 'login required' })
    })

    it('アカウントがない場合、401', async () => {
      // アカウントを削除して存在しない状態にする（Sessionも一緒に削除される）
      await accountTestHelper.deleteAllAccounts()

      const res = await requestLogout()

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data).toEqual({ message: 'login required' })
    })
  })

  describe('異常系', () => {
    it('予期しないエラーが発生した場合は500エラー', async () => {
      // ActiveUserServiceのlogoutメソッドをスパイしてエラーをスロー
      const logoutSpy = vi.spyOn(ActiveUserService.prototype, 'logout')
      logoutSpy.mockRejectedValueOnce(new Error('予期しないエラー'))

      const res = await requestLogout()

      expect(logoutSpy).toHaveBeenCalled()
      expect(res.status).toBe(500)
    })
  })
})
