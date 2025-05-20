import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { Account, Session, User } from '@prisma/client';
import AccountRepositoryImpl from '@/domain/account/infrastructure/accountRepositoryImpl';
import { AlreadyExistsError, NotFoundError, ClientError, ServerError } from '@/common/errors';

import AccountService from './accountService';
import UserRepositoryImpl from '../infrastructure/userRepositoryImpl';
import db from '@/test/__mocks__/prisma';

const mockAccount: Account = {
  accountId: BigInt(1),
  email: faker.internet.email(),
  password: 'hashed_password',
  lastLogin: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockUser: User = {
  userId: BigInt(1),
  accountId: BigInt(1),
  displayName: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockSession: Session = {
  sessionId: faker.string.uuid(),
  accountId: BigInt(1),
  sessionToken: null,
  userAgent: faker.internet.userAgent(),
  ipAddress: faker.internet.ipv4(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
};

describe('AccountService', () => {
  const accountRepo = new AccountRepositoryImpl(db);
  const userRepo = new UserRepositoryImpl(db);
  const service = new AccountService(accountRepo, userRepo);

  describe('signup', () => {
    it('正常系', async () => {
      const { email } = mockAccount;
      const plainPassword = 'password';

      db.account.create.mockResolvedValue(mockAccount);
      db.user.create.mockResolvedValue(mockUser);

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
      const { email } = mockAccount;
      const { password } = mockAccount;

      db.account.findUnique.mockResolvedValue(mockAccount);

      await expect(service.signup(email, password)).rejects.toThrow(AlreadyExistsError);
    });

    it('異常系: 意図しないDBエラー', async () => {
      const { email } = mockAccount;
      const { password } = mockAccount;

      db.account.create.mockRejectedValue(new Error('Database error'));

      await expect(service.signup(email, password)).rejects.toThrow(ServerError);
    });
  });

  describe('login', () => {
    const { email } = mockAccount;
    const { password } = mockAccount;
    const wrongPassword = 'wrong_password';

    it('正常系', async () => {
      db.account.findUnique.mockResolvedValue({
        ...mockAccount,
        password: await bcrypt.hash(password, 10),
      });
      db.user.findFirst.mockResolvedValue(mockUser);
      db.account.update.mockResolvedValue({
        ...mockAccount,
        lastLogin: new Date(),
        updatedAt: new Date(),
      });
      db.session.create.mockResolvedValue(mockSession);

      const { user, sessionId } = await service.login(email, password);
      expect(user).toBeDefined();
      expect(user.accountId).toBeDefined();
      expect(user.accountId).not.toBeNull();
      expect(user.userId).toBeDefined();
      expect(user.userId).not.toBeNull();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(sessionId).toBeDefined();
      expect(sessionId).not.toBeNull();
    });

    describe('準正常系', () => {
      it('存在しないメールアドレス', async () => {
        db.account.findUnique.mockResolvedValue(null);

        const nonExistentEmail = 'non_existent_test@example.com';
        await expect(service.login(nonExistentEmail, password)).rejects.toThrow(NotFoundError);
      });
      it('パスワードが間違っている', async () => {
        db.account.findUnique.mockResolvedValue({
          email,
          password: await bcrypt.hash(password, 10),
          accountId: BigInt(1),
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        });

        await expect(service.login(email, wrongPassword)).rejects.toThrow(
          new ClientError('Invalid password'),
        );
      });
    });

    it('異常系: 意図しないDBエラー', async () => {
      db.account.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(service.login(email, password)).rejects.toThrow(ServerError);
    });
  });

  describe('getLoginUser', () => {
    const { sessionId } = mockSession;

    it('正常系', async () => {
      db.$queryRaw.mockResolvedValue([mockUser]);

      const user = await service.getLoginUser(sessionId);

      expect(user).toBeDefined();
      expect(user.accountId).toBe(mockUser.accountId);
      expect(user.userId).toBe(mockUser.userId);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    describe('準正常系', () => {
      it('存在しないセッションID', async () => {
        db.$queryRaw.mockResolvedValue([]);

        await expect(service.getLoginUser(sessionId)).rejects.toThrow(
          new NotFoundError('User not found'),
        );
      });
    });

    it('異常系: 意図しないDBエラー', async () => {
      db.$queryRaw.mockRejectedValue(new Error('Database error'));

      await expect(service.getLoginUser(sessionId)).rejects.toThrow(ServerError);
    });
  });

  describe('logout', () => {
    const { sessionId } = mockSession;

    it('正常系', async () => {
      db.$queryRaw.mockResolvedValue([mockAccount]);
      db.session.delete.mockResolvedValue(mockSession);

      await expect(service.logout(sessionId)).resolves.not.toThrow();
    });

    describe('準正常系', () => {
      it('存在しないセッションID', async () => {
        db.$queryRaw.mockResolvedValue([]);

        await expect(service.logout(sessionId)).rejects.toThrow(
          new NotFoundError('Account not found'),
        );
      });
    });

    it('異常系: 意図しないDBエラー', async () => {
      db.$queryRaw.mockRejectedValue(new Error('Database error'));

      await expect(service.logout(sessionId)).rejects.toThrow(ServerError);
    });
  });
});
