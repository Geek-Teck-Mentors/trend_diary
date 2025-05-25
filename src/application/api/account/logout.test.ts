import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { vi, beforeEach } from 'vitest';
import getRdbClient, { Transaction } from '@/infrastructure/rdb';
import app from '../../server';
import { AccountRepositoryImpl, AccountService, UserRepositoryImpl } from '@/domain/account';
import TEST_ENV from '@/test/env';
import { SESSION_NAME } from '@/common/constants/session';
import { ClientError } from '@/common/errors';

describe('DELETE /api/account/logout', () => {
  let db: PrismaClient;
  let service: AccountService;
  let setCookie: string[];

  const TEST_EMAIL = faker.internet.email();
  const TEST_PASSWORD = 'test_password';

  async function cleanUp(): Promise<void> {
    await db.$queryRaw`TRUNCATE TABLE "accounts";`;
    await db.$queryRaw`TRUNCATE TABLE "users";`;
    await db.$queryRaw`TRUNCATE TABLE "sessions";`;
  }

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
    db = getRdbClient(TEST_ENV.DATABASE_URL);
    service = new AccountService(new AccountRepositoryImpl(db), new UserRepositoryImpl(db));
  });

  afterAll(async () => {
    await cleanUp();
    await db.$disconnect();
  });

  beforeEach(async () => {
    await cleanUp();
    // モックをリセット
    vi.clearAllMocks();

    await service.signup(new Transaction(db), TEST_EMAIL, TEST_PASSWORD);
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
      await db.session.deleteMany();

      // セッションが存在しないのでauthenticatorミドルウェアで401エラーになる
      const res = await requestLogout();

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({ message: 'login required' });
    });

    it('ClientErrorが発生した場合は400番台エラーが返される', async () => {
      // AccountServiceのlogoutメソッドをスパイしてClientErrorをスローするようにする
      const logoutSpy = vi.spyOn(AccountService.prototype, 'logout');
      const clientError = new ClientError('Bad Request', 400);
      logoutSpy.mockRejectedValueOnce(clientError);

      const res = await requestLogout();

      expect(logoutSpy).toHaveBeenCalled();
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toEqual({ message: 'Bad Request' });
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
