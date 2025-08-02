import { PrismaClient } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { isError, isSuccess } from '@/common/types/utility'
import QueryServiceImpl from './queryServiceImpl'

// モックの設定
const mockDb = mockDeep<PrismaClient>()

describe('QueryServiceImpl', () => {
  let service: QueryServiceImpl

  beforeEach(() => {
    vi.clearAllMocks()
    service = new QueryServiceImpl(mockDb)
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
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockDb.activeUser.findUnique.mockResolvedValue(mockActiveUserData)

        // Act
        const result = await service.findActiveById(activeUserId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.activeUserId).toBe(1n)
          expect(result.data?.email).toBe('test@example.com')
        }
        expect(mockDb.activeUser.findUnique).toHaveBeenCalled()
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しないActiveUserの場合nullを返す', async () => {
        // Arrange
        const activeUserId = 999n
        mockDb.activeUser.findUnique.mockResolvedValue(null)

        // Act
        const result = await service.findActiveById(activeUserId)

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
        mockDb.activeUser.findUnique.mockRejectedValue(dbError)

        // Act
        const result = await service.findActiveById(activeUserId)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
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
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockDb.activeUser.findUnique.mockResolvedValue(mockActiveUserData)

        // Act
        const result = await service.findActiveByEmail(email)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.email).toBe(email)
          expect(result.data?.activeUserId).toBe(1n)
        }
        expect(mockDb.activeUser.findUnique).toHaveBeenCalled()
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しないメールアドレスの場合nullを返す', async () => {
        // Arrange
        const email = 'notfound@example.com'
        mockDb.activeUser.findUnique.mockResolvedValue(null)

        // Act
        const result = await service.findActiveByEmail(email)

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
        mockDb.activeUser.findUnique.mockRejectedValue(dbError)

        // Act
        const result = await service.findActiveByEmail(email)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('findActiveBySessionId', () => {
    describe('基本動作', () => {
      it('有効なセッションからActiveUserを検索できる', async () => {
        // Arrange
        const SessionId = 'session123'

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

        mockDb.session.findFirst.mockResolvedValue(mockSession)

        // Act
        const result = await service.findActiveBySessionId(SessionId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.activeUserId).toBe(1n)
          expect(result.data?.email).toBe('test@example.com')
        }
        expect(mockDb.session.findFirst).toHaveBeenCalled()
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しないセッションIDの場合nullを返す', async () => {
        // Arrange
        const sessionId = 'nonexistent'
        mockDb.session.findFirst.mockResolvedValue(null)

        // Act
        const result = await service.findActiveBySessionId(sessionId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeNull()
        }
      })

      it('期限切れセッションの場合nullを返す', async () => {
        // Arrange
        const SessionId = 'expired-session'

        // 期限切れのため結果が返らない
        mockDb.session.findFirst.mockResolvedValue(null)

        // Act
        const result = await service.findActiveBySessionId(SessionId)

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
        const SessionId = 'session123'
        const dbError = new Error('Database connection failed')
        mockDb.session.findFirst.mockRejectedValue(dbError)

        // Act
        const result = await service.findActiveBySessionId(SessionId)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })
})
