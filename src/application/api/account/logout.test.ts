import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import getRdbClient from '@/infrastructure/rdb';
import app from '../../server';
import { AccountRepositoryImpl, AccountService, UserRepositoryImpl } from '@/domain/account';
import TEST_ENV from '@/test/env';

describe('DELETE /api/account/logout', () => {
  let db: PrismaClient;
  let service: AccountService;

  const TEST_EMAIL = faker.internet.email();
  const TEST_PASSWORD = 'test_password';
  let sessionId: string;

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
          Cookie: `sid=${sessionId}`,
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
    await db.$disconnect();
  });

  beforeEach(async () => {
    await service.signup(TEST_EMAIL, TEST_PASSWORD);
    // ログインしてセッションIDを取得
    const loginResult = await service.login(TEST_EMAIL, TEST_PASSWORD);
    sessionId = loginResult.sessionId;
  });

  afterEach(async () => {
    await cleanUp();
  });

  describe('正常系', () => {
    it('ログアウトに成功する', async () => {
      const res = await requestLogout();
      expect(res.status).toBe(204);
    });
  });

  describe('準正常系', () => {
    it('認証がない場合は401エラー', async () => {
      sessionId = '';
      const res = await requestLogout();
      expect(res.status).toBe(401);
    });
  });
});
