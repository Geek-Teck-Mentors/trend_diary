import AccountRepositoryImpl from '@/domain/account/infrastructure/accountRepositoryImpl';
import { AlreadyExistsError, NotFoundError, ClientError } from '@/common/errors';
import getRdbClient from '@/infrastructure/rdb';

import AccountService from './accountService';
import UserRepositoryImpl from '../infrastructure/userRepositoryImpl';

describe('AccountService', () => {
  // 各テストスイート内で共有する変数
  let db: any;
  let accountRepo: AccountRepositoryImpl;
  let userRepo: UserRepositoryImpl;
  let service: AccountService;

  beforeEach(() => {
    db = getRdbClient(process.env.DATABASE_URL ?? '');
    accountRepo = new AccountRepositoryImpl(db);
    userRepo = new UserRepositoryImpl(db);
    service = new AccountService(accountRepo, userRepo);
  });

  afterEach(async () => {
    await db.$queryRaw`TRUNCATE TABLE "accounts";`;
    await db.$queryRaw`TRUNCATE TABLE "users";`;
    await db.$disconnect();
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

  describe('login', () => {
    it('正常系', async () => {
      // 事前にアカウントを作成
      const email = 'login_success_test@example.com';
      const plainPassword = 'password';
      const account = await service.signup(email, plainPassword);

      expect(account).toBeDefined();

      const user = await service.login(email, plainPassword);

      expect(user).toBeDefined();
      expect(user.accountId).toBeDefined();
      expect(user.accountId).not.toBeNull();
      expect(user.userId).toBeDefined();
      expect(user.userId).not.toBeNull();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('異常系: 存在しないメールアドレス', async () => {
      const nonExistentEmail = 'non_existent_test@example.com';
      const plainPassword = 'password';

      await expect(service.login(nonExistentEmail, plainPassword)).rejects.toThrow(NotFoundError);
    });

    it('異常系: パスワードが間違っている', async () => {
      // 事前にアカウントを作成
      const email = 'login_wrong_password_test@example.com';
      const plainPassword = 'password';
      await service.signup(email, plainPassword);

      // 間違ったパスワードでログイン
      const wrongPassword = 'wrong_password';
      await expect(service.login(email, wrongPassword)).rejects.toThrow(ClientError);
    });
  });
});
