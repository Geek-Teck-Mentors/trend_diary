import { faker } from '@faker-js/faker'
import { Account, Session, User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { AlreadyExistsError, ClientError, NotFoundError, ServerError } from '@/common/errors'
import { resultError, resultSuccess } from '@/common/types/utility'
import AccountRepositoryImpl from '@/domain/account/infrastructure/accountRepositoryImpl'
import { Transaction } from '@/infrastructure/rdb'
import db from '@/test/__mocks__/prisma'
import UserRepositoryImpl from '../infrastructure/userRepositoryImpl'
import AccountService from './accountService'

const mockAccount: Account = {
  accountId: BigInt(1),
  email: faker.internet.email(),
  password: 'hashed_password',
  lastLogin: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
}

const mockUser: User = {
  userId: BigInt(1),
  accountId: BigInt(1),
  displayName: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
}

const mockSession: Session = {
  sessionId: faker.string.uuid(),
  accountId: BigInt(1),
  sessionToken: null,
  userAgent: faker.internet.userAgent(),
  ipAddress: faker.internet.ipv4(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
}

describe('AccountService', () => {
  const accountRepo = new AccountRepositoryImpl(db)
  const userRepo = new UserRepositoryImpl(db)
  const service = new AccountService(accountRepo, userRepo)
  const transaction = new Transaction(db)

  describe('signup', () => {
    it('正常系', async () => {
      const { email } = mockAccount
      const plainPassword = 'password'

      db.account.findUnique.mockResolvedValue(null)

      db.account.create.mockResolvedValue({
        email,
        password: 'hashed_password',
        accountId: BigInt(1),
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })
      db.user.create.mockResolvedValue({
        userId: BigInt(1),
        accountId: BigInt(1),
        displayName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      const res = await service.signup(transaction, email, plainPassword)

      expect(res).toBeDefined()
      expect(res).toEqual(
        resultSuccess({
          email,
          password: expect.any(String),
          accountId: expect.any(BigInt),
          createdAt: expect.any(Date),
          lastLogin: undefined,
          updatedAtValue: expect.any(Date),
          deletedAt: undefined,
        }),
      )
    })

    it('準正常系: 既に存在するメールアドレス', async () => {
      const { email } = mockAccount
      const { password } = mockAccount

      db.account.findUnique.mockResolvedValue(mockAccount)

      expect(await service.signup(transaction, email, password)).toEqual(
        resultError(new AlreadyExistsError('Account already exists')),
      )
    })

    it('異常系: 意図しないDBエラー', async () => {
      const { email } = mockAccount
      const { password } = mockAccount

      db.account.findUnique.mockRejectedValue(new Error('Database error'))

      expect(await service.signup(transaction, email, password)).toEqual(
        resultError(new ServerError('Database error')),
      )
    })
  })

  describe('login', () => {
    const { email } = mockAccount
    const { password } = mockAccount
    const wrongPassword = 'wrong_password'

    it('正常系', async () => {
      db.account.findUnique.mockResolvedValue({
        ...mockAccount,
        password: await bcrypt.hash(password, 10),
      })
      db.user.findFirst.mockResolvedValue(mockUser)
      db.account.update.mockResolvedValue({
        ...mockAccount,
        lastLogin: new Date(),
        updatedAt: new Date(),
      })
      db.session.create.mockResolvedValue(mockSession)

      const result = await service.login(email, password)
      expect(result).toBeDefined()
      expect(result).toEqual(
        resultSuccess({
          user: {
            userId: expect.any(BigInt),
            accountId: expect.any(BigInt),
            createdAt: expect.any(Date),
            updatedAtValue: expect.any(Date),
          },
          sessionId: mockSession.sessionId,
          expiredAt: expect.any(Date),
        }),
      )
    })

    describe('準正常系', () => {
      it('存在しないメールアドレス', async () => {
        db.account.findUnique.mockResolvedValue(null)

        const nonExistentEmail = 'non_existent_test@example.com'
        expect(await service.login(nonExistentEmail, password)).toEqual(
          resultError(new NotFoundError('Account not found')),
        )
      })

      it('パスワードが間違っている', async () => {
        db.account.findUnique.mockResolvedValue({
          email,
          password: await bcrypt.hash(password, 10),
          accountId: BigInt(1),
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        })

        expect(await service.login(email, wrongPassword)).toEqual(
          resultError(new ClientError('Invalid password')),
        )
      })
    })

    it('異常系: 意図しないDBエラー', async () => {
      db.account.findUnique.mockRejectedValue(new Error('Database error'))

      expect(await service.login(email, password)).toEqual(resultError(new Error('Database error')))
    })
  })

  describe('getLoginUser', () => {
    const { sessionId } = mockSession

    it('正常系', async () => {
      db.$queryRaw.mockResolvedValue([mockUser])

      const result = await service.getLoginUser(sessionId)

      expect(result).toBeDefined()
      expect(result).toEqual(
        resultSuccess({
          userId: mockUser.userId,
          accountId: mockUser.accountId,
          displayName: undefined,
          createdAt: expect.any(Date),
          updatedAtValue: expect.any(Date),
          deletedAtValue: undefined,
        }),
      )
    })

    describe('準正常系', () => {
      it('存在しないセッションID', async () => {
        db.$queryRaw.mockResolvedValue([])

        expect(await service.getLoginUser(sessionId)).toEqual(
          resultError(new NotFoundError('User not found')),
        )
      })
    })

    it('異常系: 意図しないDBエラー', async () => {
      db.$queryRaw.mockRejectedValue(new Error('Database error'))

      expect(await service.getLoginUser(sessionId)).toEqual(
        resultError(new Error('Database error')),
      )
    })
  })

  describe('logout', () => {
    const { sessionId } = mockSession

    it('正常系', async () => {
      db.$queryRaw.mockResolvedValue([mockAccount])
      db.session.delete.mockResolvedValue(mockSession)

      await expect(service.logout(sessionId)).resolves.not.toThrow()
    })

    describe('準正常系', () => {
      it('存在しないセッションID', async () => {
        db.$queryRaw.mockResolvedValue([])

        expect(await service.logout(sessionId)).toEqual(
          resultError(new NotFoundError('Account not found')),
        )
      })
    })

    it('異常系: 意図しないDBエラー', async () => {
      db.$queryRaw.mockRejectedValue(new Error('Database error'))

      expect(await service.logout(sessionId)).toEqual(resultError(new Error('Database error')))
    })
  })
})
