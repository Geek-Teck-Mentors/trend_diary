import AccountRepositoryImpl from '@/domain/repository/accountRepository';
import { AlreadyExistsError } from '@/common/errors';
import getRdbClient from '@/infrastructure/rdb';
import UserRepositoryImpl from '@/domain/repository/userRepository';

import AccountService from './accountService';

describe('AccountService', () => {
  const db = getRdbClient(process.env.DATABASE_URL ?? '');
  const service = new AccountService(new AccountRepositoryImpl(db), new UserRepositoryImpl(db));

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

  describe('signup', () => {
    it('正常系', async () => {
      const email = 'signup_service@test.com';
      const plainPassword = 'password';
      const res = await service.signup(email, plainPassword);

      expect(res).toBeDefined();
      expect(res.email).toBe(email);
      expect(res.password).not.toBe(plainPassword); // パスワードはハッシュ化されているはず
      expect(res.password).not.toBeNull();
      expect(res.accountId).toBeDefined();
      expect(res.accountId).not.toBeNull();
      expect(res.createdAt).toBeDefined();
      expect(res.createdAt).not.toBeNull();
      expect(res.updatedAt).toBeDefined();
      expect(res.updatedAt).not.toBeNull();
    });

    it('異常系: 既に存在するメールアドレス', async () => {
      // 一旦一度作成する
      const email = 'signup_service2@test.com';
      const plainPassword = 'password';
      await service.signup(email, plainPassword);

      // もう一度同じメールアドレスで作成しようとする
      await expect(service.signup(email, plainPassword)).rejects.toThrow(AlreadyExistsError);
    });
  });
});
