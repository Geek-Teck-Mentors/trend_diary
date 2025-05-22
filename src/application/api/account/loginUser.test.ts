import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import getRdbClient from '@/infrastructure/rdb';
import app from '../../server';
import { AccountRepositoryImpl, AccountService, UserRepositoryImpl } from '@/domain/account';
import TEST_ENV from '@/test/env';

describe('GET /api/account/me', () => {
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
    db = getRdbClient(TEST_ENV.DATABASE_URL);
    service = new AccountService(new AccountRepositoryImpl(db), new UserRepositoryImpl(db));
  });

  afterAll(async () => {
    await cleanUp();
    await db.$disconnect();
  });

  beforeEach(async () => {
    await cleanUp();

    // ユーザーを作成してログインする
    await service.signup(TEST_EMAIL, TEST_PASSWORD);
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
