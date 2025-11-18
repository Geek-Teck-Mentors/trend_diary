import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import QueryImpl from './queryImpl'

// モックの設定
const mockDb = mockDeep<PrismaClient>()

describe('QueryImpl', () => {
  let useCase: QueryImpl

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new QueryImpl(mockDb)
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

        mockDb.activeUser.findUnique.mockResolvedValue(mockActiveUserData)

        // Act
        const result = await useCase.findActiveById(activeUserId)

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
        mockDb.activeUser.findUnique.mockRejectedValue(dbError)

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

        mockDb.activeUser.findUnique.mockResolvedValue(mockActiveUserData)

        // Act
        const result = await useCase.findActiveByEmail(email)

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
        mockDb.activeUser.findUnique.mockRejectedValue(dbError)

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

        mockDb.session.findFirst.mockResolvedValue(mockSession)
        mockDb.$queryRaw.mockResolvedValue([{ count: 0n }])

        // Act
        const result = await useCase.findActiveBySessionId(sessionId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.activeUserId).toBe(1n)
          expect(result.data?.email).toBe('test@example.com')
          expect(result.data?.hasAdminAccess).toBe(false)
          expect(result.data).not.toHaveProperty('password')
        }
        expect(mockDb.session.findFirst).toHaveBeenCalled()
        expect(mockDb.$queryRaw).toHaveBeenCalled()
      })

      it('管理者権限を持つユーザーの場合hasAdminAccessがtrueになる', async () => {
        // Arrange
        const sessionId = 'admin-session'

        const mockSession = {
          sessionId: 'admin-session',
          activeUserId: 2n,
          sessionToken: 'admin-token',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date(),
          activeUser: {
            activeUserId: 2n,
            userId: 3n,
            email: 'admin@example.com',
            password: 'hashedPassword456',
            displayName: '管理者ユーザー',
            lastLogin: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }

        mockDb.session.findFirst.mockResolvedValue(mockSession)
        mockDb.$queryRaw.mockResolvedValue([{ count: 2n }])

        // Act
        const result = await useCase.findActiveBySessionId(sessionId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.activeUserId).toBe(2n)
          expect(result.data?.email).toBe('admin@example.com')
          expect(result.data?.hasAdminAccess).toBe(true)
          expect(result.data).not.toHaveProperty('password')
        }
        expect(mockDb.session.findFirst).toHaveBeenCalled()
        expect(mockDb.$queryRaw).toHaveBeenCalled()
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しないセッションIDの場合nullを返す', async () => {
        // Arrange
        const sessionId = 'nonexistent'
        mockDb.session.findFirst.mockResolvedValue(null)

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
        mockDb.session.findFirst.mockResolvedValue(null)

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
        mockDb.session.findFirst.mockRejectedValue(dbError)

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
})
