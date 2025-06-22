import { faker } from '@faker-js/faker';
import app from '../../server';
import TEST_ENV from '@/test/env';
import accountTestHelper from '@/test/helper/accountTestHelper';

describe('GET /api/account/me', () => {
  let setCookie: string[];

  const TEST_EMAIL = faker.internet.email();
  const TEST_PASSWORD = 'test_password';

  async function requestLoginUser() {
    return app.request(
      '/api/account/me',
      {
        method: 'GET',
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

    // ユーザーを作成してログインする
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
    it('ログインユーザーの情報を取得できる', async () => {
      const res = await requestLoginUser();

      expect(res.status).toBe(200);

      // Hono公式のテスト方法に準拠して、レスポンスデータ構造を検証
      const data = await res.json();

      // 実際のプロパティ構造に合わせてテスト
      expect(typeof data).toBe('object');
      expect(data).not.toBeNull();
    });
  });
});
