import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import getRdbClient from '@/infrastructure/rdb';
import app from '../../server';
import { AccountRepositoryImpl, AccountService, UserRepositoryImpl } from '@/domain/account';
import TEST_ENV from '@/test/env';

type LoginTestCase = {
  name: string;
  input: { email: string; password: string };
  status: number;
};

describe('POST /api/account/login', () => {
  let db: PrismaClient;
  let service: AccountService;

  const TEST_EMAIL = faker.internet.email();
  const TEST_PASSWORD = 'test_password';

  async function cleanUp(): Promise<void> {
    await db.$queryRaw`TRUNCATE TABLE "accounts";`;
    await db.$queryRaw`TRUNCATE TABLE "users";`;
  }

  async function requestLogin(body: string) {
    return app.request(
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
  });

  afterEach(async () => {
    await cleanUp();
  });

  describe('正常系', () => {
    it('ログインに成功する', async () => {
      const requestBody = JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD });
      const res = await requestLogin(requestBody);

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toBeDefined();
    });
  });

  describe('準正常系', () => {
    const testCases: LoginTestCase[] = [
      {
        name: '不正なメールアドレス',
        input: { email: 'login-invalid-email', password: 'test_password' },
        status: 422,
      },
      {
        name: '不正なパスワード',
        input: { email: faker.internet.email(), password: '' },
        status: 422,
      },
      {
        name: '存在しないアカウント',
        input: { email: 'nonexistent@example.com', password: 'test_password' },
        status: 404,
      },
      {
        name: 'パスワードが間違っている',
        input: { email: TEST_EMAIL, password: 'wrong_password' },
        status: 400,
      },
    ];

    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        const res = await requestLogin(JSON.stringify(testCase.input));
        expect(res.status).toBe(testCase.status);
      });
    });
  });
});
