import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import AccountRepositoryImpl from '@/domain/account/infrastructure/accountRepositoryImpl';
import { AlreadyExistsError, NotFoundError, ClientError } from '@/common/errors';

import AccountService from './accountService';
import UserRepositoryImpl from '../infrastructure/userRepositoryImpl';
import db from '@/test/__mocks__/prisma';

describe('AccountService', () => {
  const accountRepo = new AccountRepositoryImpl(db);
  const userRepo = new UserRepositoryImpl(db);
  const service = new AccountService(accountRepo, userRepo);

  describe('signup', () => {
    it('正常系', async () => {
      const email = faker.internet.email();
      const plainPassword = 'password';

      db.account.create.mockResolvedValue({
        email,
        password: 'hashed_password',
        accountId: BigInt(1),
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      db.user.create.mockResolvedValue({
        userId: BigInt(1),
        accountId: BigInt(1),
        displayName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

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

    it('準正常系: 既に存在するメールアドレス', async () => {
      const email = faker.internet.email();
      const plainPassword = 'password';

      db.account.create.mockResolvedValue({
        email,
        password: await bcrypt.hash(plainPassword, 10),
        accountId: BigInt(1),
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      db.user.create.mockResolvedValue({
        userId: BigInt(1),
        accountId: BigInt(1),
        displayName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      await service.signup(email, plainPassword);

      db.account.create.mockRejectedValueOnce(new AlreadyExistsError('アカウントは既に存在します'));

      // もう一度同じメールアドレスで作成しようとする
      await expect(service.signup(email, plainPassword)).rejects.toThrowError(
        'アカウントは既に存在します',
      );
    });
  });

  describe('login', () => {
    const email = faker.internet.email();
    const plainPassword = 'password';
    const wrongPassword = 'wrong_password';

    it('正常系', async () => {
      db.account.findUnique.mockResolvedValue({
        email,
        password: await bcrypt.hash(plainPassword, 10),
        accountId: BigInt(1),
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      db.user.findFirst.mockResolvedValue({
        userId: BigInt(1),
        accountId: BigInt(1),
        displayName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      db.account.update.mockResolvedValue({
        email,
        password: await bcrypt.hash(plainPassword, 10),
        accountId: BigInt(1),
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const user = await service.login(email, plainPassword);
      expect(user).toBeDefined();
      expect(user.accountId).toBeDefined();
      expect(user.accountId).not.toBeNull();
      expect(user.userId).toBeDefined();
      expect(user.userId).not.toBeNull();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('準正常系: 存在しないメールアドレス', async () => {
      const nonExistentEmail = 'non_existent_test@example.com';
      await expect(service.login(nonExistentEmail, plainPassword)).rejects.toThrow(NotFoundError);
    });

    it('準正常系: パスワードが間違っている', async () => {
      await expect(service.login(email, wrongPassword)).rejects.toThrow(ClientError);
    });
  });
});
