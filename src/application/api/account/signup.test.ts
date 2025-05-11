import getRdbClient from '@/infrastructure/rdb';
import app from '../../server';
import TEST_ENV from '@/test/env';

describe('POST /api/account', () => {
  const db = getRdbClient(TEST_ENV.DATABASE_URL ?? '');

  async function cleanUp() {
    await db.$queryRaw`TRUNCATE TABLE "accounts";`;
    await db.$queryRaw`TRUNCATE TABLE "users";`;
  }

  beforeAll(async () => {
    await cleanUp();
  });

  afterAll(async () => {
    await cleanUp();
  });

  async function requestShort(body: string) {
    return app.request(
      '/api/account',
      {
        method: 'POST',
        body,
      },
      TEST_ENV,
    );
  }

  it('正常系', async () => {
    const res = await requestShort(
      JSON.stringify({ email: 'signup@test.com', password: 'test_password' }),
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({});
  });

  describe('準正常系', async () => {
    const testCases: Array<{
      name: string;
      input: string | { email: string; password: string };
      status: number;
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
    ];

    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        const res = await requestShort(JSON.stringify(testCase.input));
        expect(res.status).toBe(testCase.status);
      });
    });

    it('既に存在するメールアドレスの場合', async () => {
      const email = 'test@example.com';

      // 1回目の登録
      const res1 = await requestShort(JSON.stringify({ email, password: 'test_password' }));
      expect(res1.status).toBe(201);

      // 2回目の登録
      const res2 = await requestShort(JSON.stringify({ email, password: 'test_password' }));
      expect(res2.status).toBe(409);
    });
  });
});
