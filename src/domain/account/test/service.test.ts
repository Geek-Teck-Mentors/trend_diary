import { AlreadyExistsError } from '../../../common/errors';
import getRdbClient from '../../../infrastructure/rdb';
import UserRepositoryImpl from '../../user/repository/userRepository';
import AccountRepositoryImpl from '../repository/accountRepository';
import AccountService from '../service';

describe('AccountService', () => {
  const db = getRdbClient(process.env.DATABASE_URL ?? '');
  const service = new AccountService(new AccountRepositoryImpl(db), new UserRepositoryImpl(db));

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

  describe('signUp', () => {
    it('正常系', async () => {
      const email = 'test@test.com';
      const plainPassword = 'password';
      const res = await service.signUp(email, plainPassword);

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

    it('異常系: すでに存在するメールアドレス', async () => {
      // 一旦一度作成する
      const email = 'test@test.com';
      const plainPassword = 'password';
      await service.signUp(email, plainPassword);

      // もう一度同じメールアドレスで作成しようとする

      await expect(service.signUp(email, plainPassword)).rejects.toThrow(AlreadyExistsError);
    });
  });
});
