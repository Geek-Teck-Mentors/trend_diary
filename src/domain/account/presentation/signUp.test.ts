import getRdbClient from '../../../infrastructure/rdb';
import app from '../../../server';

const env = {
  DATABASE_URL: process.env.DATABASE_URL,
};

describe('Accounts', () => {
  const db = getRdbClient(env.DATABASE_URL ?? '');

  async function cleanUp() {
    await db.$queryRaw`TRUNCATE TABLE "accounts";`;
    await db.$queryRaw`TRUNCATE TABLE "users";`;
  }

  beforeEach(async () => {
    await cleanUp();
  });

  afterAll(async () => {
    await cleanUp();
  });

  describe('POST /api/account', () => {
    it('正常系', async () => {
      const res = await app.request(
        '/api/account',
        {
          method: 'POST',
          body: JSON.stringify({ email: 'test@test.com', password: 'test_password' }),
        },
        env,
      );

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toEqual({
        accountId: expect.any(String),
        email: expect.any(String),
      });
    });
  });
});
