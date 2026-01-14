import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import prisma from '@/test/__mocks__/prisma'
import QueryImpl from './query-impl'

describe('QueryImpl', () => {
  let useCase: QueryImpl

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new QueryImpl(prisma)
  })

  describe('findActiveById', () => {
    describe('基本動作', () => {
      it('ActiveUserをIDで検索できる', async () => {
        // Arrange
        const activeUserId = 1n

        const mockActiveUserData = {
          activeUserId: 1n,
          userId: 2n,
          email: 'test@example.com',
          password: 'hashedPassword123',
          displayName: 'テストユーザー',
          authenticationId: null,
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        prisma.activeUser.findUnique.mockResolvedValue(mockActiveUserData)

        // Act
        const result = await useCase.findActiveById(activeUserId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.activeUserId).toBe(1n)
          expect(result.data?.email).toBe('test@example.com')
        }
        expect(prisma.activeUser.findUnique).toHaveBeenCalled()
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しないActiveUserの場合nullを返す', async () => {
        // Arrange
        const activeUserId = 999n
        prisma.activeUser.findUnique.mockResolvedValue(null)

        // Act
        const result = await useCase.findActiveById(activeUserId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeNull()
        }
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const activeUserId = 1n
        const dbError = new Error('Database connection failed')
        prisma.activeUser.findUnique.mockRejectedValue(dbError)

        // Act
        const result = await useCase.findActiveById(activeUserId)

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('findActiveByEmail', () => {
    describe('基本動作', () => {
      it('ActiveUserをメールアドレスで検索できる', async () => {
        // Arrange
        const email = 'test@example.com'

        const mockActiveUserData = {
          activeUserId: 1n,
          userId: 2n,
          email,
          password: 'hashedPassword123',
          displayName: 'テストユーザー',
          authenticationId: null,
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        prisma.activeUser.findUnique.mockResolvedValue(mockActiveUserData)

        // Act
        const result = await useCase.findActiveByEmail(email)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.email).toBe(email)
          expect(result.data?.activeUserId).toBe(1n)
        }
        expect(prisma.activeUser.findUnique).toHaveBeenCalled()
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しないメールアドレスの場合nullを返す', async () => {
        // Arrange
        const email = 'notfound@example.com'
        prisma.activeUser.findUnique.mockResolvedValue(null)

        // Act
        const result = await useCase.findActiveByEmail(email)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeNull()
        }
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const email = 'test@example.com'
        const dbError = new Error('Database connection failed')
        prisma.activeUser.findUnique.mockRejectedValue(dbError)

        // Act
        const result = await useCase.findActiveByEmail(email)

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('findActiveBySessionId', () => {
    describe('基本動作', () => {
      it('有効なセッションからActiveUserを検索できる', async () => {
        // Arrange
        const sessionId = 'session123'

        const mockSession = {
          sessionId: 'session123',
          activeUserId: 1n,
          sessionToken: 'token123',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date(),
          activeUser: {
            activeUserId: 1n,
            userId: 2n,
            email: 'test@example.com',
            password: 'hashedPassword123',
            displayName: 'テストユーザー',
            lastLogin: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }

        prisma.session.findFirst.mockResolvedValue(mockSession)

        // Act
        const result = await useCase.findActiveBySessionId(sessionId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.activeUserId).toBe(1n)
          expect(result.data?.email).toBe('test@example.com')
          expect(result.data).not.toHaveProperty('password')
        }
        expect(prisma.session.findFirst).toHaveBeenCalled()
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しないセッションIDの場合nullを返す', async () => {
        // Arrange
        const sessionId = 'nonexistent'
        prisma.session.findFirst.mockResolvedValue(null)

        // Act
        const result = await useCase.findActiveBySessionId(sessionId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeNull()
        }
      })

      it('期限切れセッションの場合nullを返す', async () => {
        // Arrange
        const sessionId = 'expired-session'

        // 期限切れのため結果が返らない
        prisma.session.findFirst.mockResolvedValue(null)

        // Act
        const result = await useCase.findActiveBySessionId(sessionId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeNull()
        }
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const sessionId = 'session123'
        const dbError = new Error('Database connection failed')
        prisma.session.findFirst.mockRejectedValue(dbError)

        // Act
        const result = await useCase.findActiveBySessionId(sessionId)

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('findActiveByEmailForAuth', () => {
    describe('基本動作', () => {
      it('ActiveUserをメールアドレスで検索してパスワード付きで返す', async () => {
        // Arrange
        const email = 'test@example.com'

        const mockActiveUserData = {
          activeUserId: 1n,
          userId: 2n,
          email,
          password: 'hashedPassword123',
          displayName: 'テストユーザー',
          authenticationId: 'auth-id-123',
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        prisma.activeUser.findUnique.mockResolvedValue(mockActiveUserData)

        // Act
        const result = await useCase.findActiveByEmailForAuth(email)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.email).toBe(email)
          expect(result.data?.password).toBe('hashedPassword123')
          expect(result.data?.authenticationId).toBe('auth-id-123')
        }
        expect(prisma.activeUser.findUnique).toHaveBeenCalledWith({
          where: { email },
        })
      })

      it('authenticationIdがnullの場合undefinedに変換される', async () => {
        // Arrange
        const email = 'test@example.com'

        const mockActiveUserData = {
          activeUserId: 1n,
          userId: 2n,
          email,
          password: 'hashedPassword123',
          displayName: 'テストユーザー',
          authenticationId: null,
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        prisma.activeUser.findUnique.mockResolvedValue(mockActiveUserData)

        // Act
        const result = await useCase.findActiveByEmailForAuth(email)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.authenticationId).toBeUndefined()
          expect(result.data?.lastLogin).toBeUndefined()
        }
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しないメールアドレスの場合nullを返す', async () => {
        // Arrange
        const email = 'notfound@example.com'
        prisma.activeUser.findUnique.mockResolvedValue(null)

        // Act
        const result = await useCase.findActiveByEmailForAuth(email)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeNull()
        }
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const email = 'test@example.com'
        const dbError = new Error('Database connection failed')
        prisma.activeUser.findUnique.mockRejectedValue(dbError)

        // Act
        const result = await useCase.findActiveByEmailForAuth(email)

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('findActiveByAuthenticationId', () => {
    describe('基本動作', () => {
      it('ActiveUserを認証IDで検索できる', async () => {
        // Arrange
        const authenticationId = 'auth-id-123'

        const mockActiveUserData = {
          activeUserId: 1n,
          userId: 2n,
          email: 'test@example.com',
          password: 'hashedPassword123',
          displayName: 'テストユーザー',
          authenticationId,
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        prisma.activeUser.findUnique.mockResolvedValue(mockActiveUserData)

        // Act
        const result = await useCase.findActiveByAuthenticationId(authenticationId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.activeUserId).toBe(1n)
          expect(result.data?.email).toBe('test@example.com')
          // mapToActiveUserを通すのでpasswordは含まれない
          expect(result.data).not.toHaveProperty('password')
        }
        expect(prisma.activeUser.findUnique).toHaveBeenCalledWith({
          where: { authenticationId },
        })
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しない認証IDの場合nullを返す', async () => {
        // Arrange
        const authenticationId = 'nonexistent-auth-id'
        prisma.activeUser.findUnique.mockResolvedValue(null)

        // Act
        const result = await useCase.findActiveByAuthenticationId(authenticationId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeNull()
        }
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const authenticationId = 'auth-id-123'
        const dbError = new Error('Database connection failed')
        prisma.activeUser.findUnique.mockRejectedValue(dbError)

        // Act
        const result = await useCase.findActiveByAuthenticationId(authenticationId)

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })
})
