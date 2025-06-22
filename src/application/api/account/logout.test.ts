import { faker } from '@faker-js/faker';
import app from '../../server';
import TEST_ENV from '@/test/env';
import { SESSION_NAME } from '@/common/constants/session';
import accountTestHelper from '@/test/helper/accountTestHelper';
import getRdbClient from '@/infrastructure/rdb';
import { AccountService } from '@/domain/account';

describe('DELETE /api/account/logout', () => {
  let setCookie: string[];

  const TEST_EMAIL = faker.internet.email();
  const TEST_PASSWORD = 'test_password';

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
    );
  }

  beforeAll(() => {
    // accountTestHelperを使用
  });

  afterAll(async () => {
    await accountTestHelper.cleanUp();
    await accountTestHelper.disconnect();
  });

  beforeEach(async () => {
    await accountTestHelper.cleanUp();
    // モックをリセット
    vi.clearAllMocks();

    await accountTestHelper.createTestAccount(TEST_EMAIL, TEST_PASSWORD);
    const body = JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD });

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
    );
    setCookie = res.headers.getSetCookie();
  });

  describe('正常系', () => {
    it('ログアウトに成功する', async () => {
      const res = await requestLogout();
      expect(res.status).toBe(204);
    });
  });

  describe('準正常系', () => {
    it('認証がない場合は401エラー', async () => {
      setCookie = [];
      const res = await requestLogout();
      expect(res.status).toBe(401);
    });

    it('セッションが見つからない場合は401エラー', async () => {
      // 有効なセッションIDを含むCookieを作るが、DBからセッションを削除して存在しない状態にする
      const sessionCookie = setCookie.find((cookie) => cookie.startsWith(`${SESSION_NAME}=`));
      if (!sessionCookie) {
        throw new Error('セッションCookieが見つかりません');
      }

      // DBのセッションを直接削除
      const db = getRdbClient(TEST_ENV.DATABASE_URL);
      await db.session.deleteMany();
      await db.$disconnect();

      // セッションが存在しないのでauthenticatorミドルウェアで401エラーになる
      const res = await requestLogout();

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({ message: 'login required' });
    });

    it('アカウントがない場合、404', async () => {
      // アカウントを削除して存在しない状態にする
      const db = getRdbClient(TEST_ENV.DATABASE_URL);
      await db.account.deleteMany();
      await db.$disconnect();

      const res = await requestLogout();

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toEqual({ message: 'Account not found' });
    });
  });

  describe('異常系', () => {
    it('予期しないエラーが発生した場合は500エラー', async () => {
      // AccountServiceのlogoutメソッドをスパイしてエラーをスロー
      const logoutSpy = vi.spyOn(AccountService.prototype, 'logout');
      logoutSpy.mockRejectedValueOnce(new Error('予期しないエラー'));

      const res = await requestLogout();

      expect(logoutSpy).toHaveBeenCalled();
      expect(res.status).toBe(500);
    });
  });
});
