import bcrypt from 'bcryptjs'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'
import { isError, isSuccess } from '@/common/types/utility'
import { AlreadyExistsError, NotFoundError } from '@/common/errors'
import { TransactionClient } from '@/infrastructure/rdb'
import ActiveUserService from './activeUserService'
import { ActiveUserRepository } from '../repository/activeUserRepository'
import { UserRepository } from '../repository/userRepository'
import Session from '../model/session'
import { SessionRepository } from '../repository/sessionRepository'

// モックの設定
const mockActiveUserRepository = mockDeep<ActiveUserRepository>()
const mockUserRepository = mockDeep<UserRepository>()
const mockSessionRepository = mockDeep<SessionRepository>()
const mockTransaction = mockDeep<TransactionClient>()

describe('ActiveUserService', () => {
  let service: ActiveUserService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ActiveUserService(
      mockActiveUserRepository,
      mockUserRepository,
      mockSessionRepository,
    )
  })

  describe('正常系', () => {
    describe('signup', () => {
      it('新規ユーザーを作成できる', async () => {
        // このテストは現在失敗する（ActiveUserServiceが存在しないため）
        const email = 'test@example.com'
        const password = 'password123'
        const displayName = 'テストユーザー'

        // Arrange - 重複チェックでnullを返す
        mockActiveUserRepository.findByEmail.mockResolvedValue({
          data: null,
        })

        // User作成
        mockUserRepository.create.mockResolvedValue({
          data: {
            userId: 1n,
            createdAt: new Date(),
          },
        })

        // ActiveUser作成  
        const mockActiveUser = {
          activeUserId: 2n,
          userId: 1n,
          email,
          password: 'hashedPassword',
          displayName,
          lastLogin: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          recordLogin: vi.fn(),
        }
        mockActiveUserRepository.createActiveUser.mockResolvedValue({
          data: mockActiveUser,
        })

        // Act
        const result = await service.signup(mockTransaction, email, password, displayName)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.email).toBe(email)
          expect(result.data.displayName).toBe(displayName)
        }
        expect(mockActiveUserRepository.findByEmail).toHaveBeenCalledWith(email)
        expect(mockUserRepository.create).toHaveBeenCalled()
        expect(mockActiveUserRepository.createActiveUser).toHaveBeenCalled()
      })
    })

    describe('login', () => {
      it('有効な認証情報でログインできる', async () => {
        // このテストは現在失敗する（ActiveUserServiceが存在しないため）
        const email = 'test@example.com'
        const password = 'password123'
        const hashedPassword = await bcrypt.hash(password, 10)

        // Arrange
        mockActiveUserRepository.findByEmail.mockResolvedValue({
          data: {
            activeUserId: 1n,
            userId: 2n,
            email,
            password: hashedPassword,
            displayName: 'テストユーザー',
            lastLogin: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            recordLogin: vi.fn(),
          },
        })

        mockUserRepository.findById.mockResolvedValue({
          data: {
            userId: 2n,
            createdAt: new Date(),
          },
        })

        const mockSession = new Session(
          'session-123',
          1n,
          'token-456',
          new Date(Date.now() + 24 * 60 * 60 * 1000),
          '192.168.1.1',
          'Mozilla/5.0',
          new Date(),
          false
        )
        mockSessionRepository.create.mockResolvedValue({
          data: mockSession,
        })

        // Act
        const result = await service.login(mockTransaction, email, password, '192.168.1.1', 'Mozilla/5.0')

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.user.userId).toBe(2n)
          expect(result.data.sessionId).toMatch(/^[0-9a-f-]{36}$/) // UUID形式をチェック
        }
      })
    })
  })

  describe('準正常系', () => {
    describe('signup', () => {
      it('displayNameがnullでもユーザーを作成できる', async () => {
        // このテストは現在失敗する（ActiveUserServiceが存在しないため）
        const email = 'test@example.com'
        const password = 'password123'

        // Arrange
        mockActiveUserRepository.findByEmail.mockResolvedValue({
          data: null,
        })

        mockUserRepository.create.mockResolvedValue({
          data: {
            userId: 1n,
            createdAt: new Date(),
          },
        })

        mockActiveUserRepository.createActiveUser.mockResolvedValue({
          data: {
            activeUserId: 2n,
            userId: 1n,
            email,
            password: 'hashedPassword',
            displayName: null,
            lastLogin: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            recordLogin: vi.fn(),
          },
        })

        // Act
        const result = await service.signup(mockTransaction, email, password)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.displayName).toBeNull()
        }
      })
    })
  })

  describe('異常系', () => {
    describe('signup', () => {
      it('重複するメールアドレスでは作成に失敗する', async () => {
        // このテストは現在失敗する（ActiveUserServiceが存在しないため）
        const email = 'duplicate@example.com'
        const password = 'password123'

        // Arrange - 既存ユーザーが存在
        mockActiveUserRepository.findByEmail.mockResolvedValue({
          data: {
            activeUserId: 1n,
            userId: 2n,
            email,
            password: 'existingPassword',
            displayName: '既存ユーザー',
            lastLogin: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            recordLogin: vi.fn(),
          },
        })

        // Act
        const result = await service.signup(mockTransaction, email, password)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(AlreadyExistsError)
        }
      })
    })

    describe('login', () => {
      it('存在しないメールアドレスではログインに失敗する', async () => {
        // このテストは現在失敗する（ActiveUserServiceが存在しないため）
        const email = 'notfound@example.com'
        const password = 'password123'

        // Arrange
        mockActiveUserRepository.findByEmail.mockResolvedValue({
          data: null,
        })

        // Act
        const result = await service.login(mockTransaction, email, password, '192.168.1.1', 'Mozilla/5.0')

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(NotFoundError)
        }
      })

      it('間違ったパスワードではログインに失敗する', async () => {
        // このテストは現在失敗する（ActiveUserServiceが存在しないため）
        const email = 'test@example.com'
        const correctPassword = 'password123'
        const wrongPassword = 'wrongpassword'
        const hashedPassword = await bcrypt.hash(correctPassword, 10)

        // Arrange
        mockActiveUserRepository.findByEmail.mockResolvedValue({
          data: {
            activeUserId: 1n,
            userId: 2n,
            email,
            password: hashedPassword,
            displayName: 'テストユーザー',
            lastLogin: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            recordLogin: vi.fn(),
          },
        })

        // Act
        const result = await service.login(mockTransaction, email, wrongPassword, '192.168.1.1', 'Mozilla/5.0')

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toContain('Invalid credentials')
        }
      })
    })
  })
})