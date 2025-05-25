import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { err, ok } from 'neverthrow';
import AccountRepositoryImpl from '@/domain/account/infrastructure/accountRepositoryImpl';
import { AlreadyExistsError, NotFoundError, ClientError, ServerError } from '@/common/errors';

import AccountService from './accountService';
import UserRepositoryImpl from '../infrastructure/userRepositoryImpl';
import db from '@/test/__mocks__/prisma';
import { Transaction } from '@/infrastructure/rdb';

describe('AccountService', () => {
  const accountRepo = new AccountRepositoryImpl(db);
  const userRepo = new UserRepositoryImpl(db);
  const service = new AccountService(accountRepo, userRepo, new Transaction(db));

  describe('signup', () => {
    it('正常系', async () => {
      const email = faker.internet.email();
      const plainPassword = 'password';

      db.account.findUnique.mockResolvedValue(null);

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
      expect(res).toEqual(
        ok({
          email,
          password: expect.any(String),
          accountId: expect.any(BigInt),
          createdAt: expect.any(Date),
          lastLogin: undefined,
          updatedAtValue: expect.any(Date),
          deletedAt: undefined,
        }),
      );
    });

    it('準正常系: 既に存在するメールアドレス', async () => {
      const email = faker.internet.email();
      const plainPassword = 'password';

      db.account.findUnique.mockResolvedValue({
        accountId: BigInt(1),
        email,
        password: await bcrypt.hash(plainPassword, 10),
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      expect(await service.signup(email, plainPassword)).toEqual(
        err(new AlreadyExistsError('Account already exists')),
      );
    });

    it('異常系: 意図しないDBエラー', async () => {
      const email = faker.internet.email();
      const plainPassword = 'password';

      db.account.findUnique.mockRejectedValue(new Error('Database error'));

      expect(await service.signup(email, plainPassword)).toEqual(
        err(new ServerError('Database error')),
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
      expect(user).toEqual(
        ok({
          userId: expect.any(BigInt),
          accountId: expect.any(BigInt),
          createdAt: expect.any(Date),
          updatedAtValue: expect.any(Date),
        }),
      );
    });

    describe('準正常系', () => {
      it('存在しないメールアドレス', async () => {
        db.account.findUnique.mockResolvedValue(null);

        const nonExistentEmail = 'non_existent_test@example.com';
        expect(await service.login(nonExistentEmail, plainPassword)).toEqual(
          err(new NotFoundError('Account not found')),
        );
      });

      it('パスワードが間違っている', async () => {
        db.account.findUnique.mockResolvedValue({
          email,
          password: await bcrypt.hash(plainPassword, 10),
          accountId: BigInt(1),
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        });

        expect(await service.login(email, wrongPassword)).toEqual(
          err(new ClientError('Invalid password')),
        );
      });
    });

    it('異常系: 意図しないDBエラー', async () => {
      db.account.findUnique.mockRejectedValue(new Error('Database error'));

      expect(await service.login(email, plainPassword)).toEqual(err(new Error('Database error')));
    });
  });
});
