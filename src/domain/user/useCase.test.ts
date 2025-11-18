import { isFailure, isSuccess, success } from '@yuukihayashi0510/core'
import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { AlreadyExistsError, NotFoundError } from '@/common/errors'
import { Command, Query } from './repository'
import { UseCase } from './useCase'

// モックの設定
const mockQuery = mockDeep<Query>()
const mockCommand = mockDeep<Command>()

describe('User UseCase', () => {
  let useCase: UseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new UseCase(mockQuery, mockCommand)
  })

  describe('signup', () => {
    describe('基本動作', () => {
      it('新規ユーザーを作成できる', async () => {
        const email = 'test@example.com'
        const password = 'password123'

        // Arrange - 重複チェックでnullを返す
        mockQuery.findActiveByEmail.mockResolvedValue(success(null))

        // ActiveUser作成
        const mockActiveUser = {
          activeUserId: 1n,
          userId: 2n,
          email,
          password: 'hashedPassword',
          displayName: 'テストユーザー',
          authenticationId: null,
          lastLogin: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          adminUserId: null,
        }
        mockCommand.createActive.mockResolvedValue(success(mockActiveUser))

        // Act
        const result = await useCase.signup(email, password)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.email).toBe(email)
        }
        expect(mockQuery.findActiveByEmail).toHaveBeenCalledWith(email)
        expect(mockCommand.createActive).toHaveBeenCalledWith(email, expect.any(String))
      })
    })

    describe('境界値・特殊値', () => {
      it('既存のユーザーが存在する場合でも作成できる', async () => {
        const email = 'test@example.com'
        const password = 'password123'

        // Arrange
        mockQuery.findActiveByEmail.mockResolvedValue(success(null))

        const mockActiveUser = {
          activeUserId: 1n,
          userId: 2n,
          email,
          password: 'hashedPassword',
          displayName: null,
          authenticationId: null,
          lastLogin: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          adminUserId: null,
        }
        mockCommand.createActive.mockResolvedValue(success(mockActiveUser))

        // Act
        const result = await useCase.signup(email, password)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.displayName).toBeNull()
        }
      })
    })

    describe('例外・制約違反', () => {
      it('重複するメールアドレスでは作成に失敗する', async () => {
        const email = 'duplicate@example.com'
        const password = 'password123'

        // Arrange - 既存ユーザーが存在
        const existingUser = {
          activeUserId: 1n,
          userId: 2n,
          email,
          password: 'existingPassword',
          displayName: '既存ユーザー',
          authenticationId: null,
          lastLogin: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          adminUserId: null,
        }
        mockQuery.findActiveByEmail.mockResolvedValue(success(existingUser))

        // Act
        const result = await useCase.signup(email, password)

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error).toBeInstanceOf(AlreadyExistsError)
        }
      })
    })
  })

  describe('login', () => {
    describe('基本動作', () => {
      it('有効な認証情報でログインできる', async () => {
        const email = 'test@example.com'
        const password = 'password123'
        const hashedPassword = await bcrypt.hash(password, 10)

        // Arrange
        const mockActiveUser = {
          activeUserId: 1n,
          userId: 2n,
          email,
          password: hashedPassword,
          displayName: 'テストユーザー',
          authenticationId: null,
          lastLogin: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          adminUserId: null,
        }
        mockQuery.findActiveByEmailForAuth.mockResolvedValue(success(mockActiveUser))

        mockCommand.createSession.mockResolvedValue(
          success({
            sessionId: 'session-123',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          }),
        )

        // ActiveUser保存のモック
        const updatedActiveUser = {
          activeUserId: 1n,
          userId: 2n,
          email,
          password: hashedPassword,
          displayName: 'テストユーザー',
          authenticationId: null,
          lastLogin: new Date(), // lastLoginが更新される
          createdAt: new Date(),
          updatedAt: new Date(),
          adminUserId: null,
        }
        mockCommand.saveActive.mockResolvedValue(success(updatedActiveUser))

        // Act
        const result = await useCase.login(email, password, '192.168.1.1', 'Mozilla/5.0')

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.activeUser.activeUserId).toBe(1n)
          expect(result.data.sessionId.length).toBeGreaterThan(0)
        }
      })
    })

    describe('例外・制約違反', () => {
      it('存在しないメールアドレスではログインに失敗する', async () => {
        const email = 'notfound@example.com'
        const password = 'password123'

        // Arrange
        mockQuery.findActiveByEmailForAuth.mockResolvedValue(success(null))

        // Act
        const result = await useCase.login(email, password, '192.168.1.1', 'Mozilla/5.0')

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error).toBeInstanceOf(NotFoundError)
        }
      })

      it('間違ったパスワードではログインに失敗する', async () => {
        const email = 'test@example.com'
        const correctPassword = 'password123'
        const wrongPassword = 'wrongpassword'
        const hashedPassword = await bcrypt.hash(correctPassword, 10)

        // Arrange
        const mockActiveUser = {
          activeUserId: 1n,
          userId: 2n,
          email,
          password: hashedPassword,
          displayName: 'テストユーザー',
          authenticationId: null,
          lastLogin: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          adminUserId: null,
        }
        mockQuery.findActiveByEmailForAuth.mockResolvedValue(success(mockActiveUser))

        // Act
        const result = await useCase.login(email, wrongPassword, '192.168.1.1', 'Mozilla/5.0')

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error.message).toContain('Invalid credentials')
        }
      })
    })
  })
})
