import { PrismaClient } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { isError, isSuccess } from '@/common/types/utility'
import SessionRepositoryImpl from './sessionRepositoryImpl'

const mockDb = mockDeep<PrismaClient>()

describe('SessionRepositoryImpl', () => {
  let repository: SessionRepositoryImpl

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new SessionRepositoryImpl(mockDb)
  })

  describe('create', () => {
    describe('基本動作', () => {
      it('Sessionを作成できる', async () => {
        // Arrange
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const input = {
          sessionId: 'session123',
          activeUserId: 1n,
          sessionToken: 'token123',
          expiresAt: futureDate,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }

        const mockSession = {
          sessionId: 'session123',
          activeUserId: 1n,
          sessionToken: 'token123',
          expiresAt: futureDate,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date(),
        }

        mockDb.session.create.mockResolvedValue(mockSession)

        // Act
        const result = await repository.create(input)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.sessionId).toBe('session123')
          expect(result.data.activeUserId).toBe(1n)
          expect(result.data.sessionToken).toBe('token123')
        }
        expect(mockDb.session.create).toHaveBeenCalledWith({
          data: input,
        })
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const input = {
          sessionId: 'session123',
          activeUserId: 1n,
          sessionToken: 'token123',
          expiresAt: futureDate,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }
        const dbError = new Error('Database connection failed')
        mockDb.session.create.mockRejectedValue(dbError)

        // Act
        const result = await repository.create(input)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('findById', () => {
    describe('基本動作', () => {
      it('SessionをIDで検索できる', async () => {
        // Arrange
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const sessionId = 'session123'
        const mockSession = {
          sessionId: 'session123',
          activeUserId: 1n,
          sessionToken: 'token123',
          expiresAt: futureDate,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date(),
        }

        mockDb.session.findUnique.mockResolvedValue(mockSession)

        // Act
        const result = await repository.findById(sessionId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.sessionId).toBe('session123')
          expect(result.data?.activeUserId).toBe(1n)
        }
        expect(mockDb.session.findUnique).toHaveBeenCalledWith({
          where: { sessionId },
        })
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しないSessionの場合nullを返す', async () => {
        // Arrange
        const sessionId = 'nonexistent'
        mockDb.session.findUnique.mockResolvedValue(null)

        // Act
        const result = await repository.findById(sessionId)

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
        mockDb.session.findUnique.mockRejectedValue(dbError)

        // Act
        const result = await repository.findById(sessionId)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('findByActiveUserId', () => {
    describe('基本動作', () => {
      it('SessionをActiveUserIDで検索できる', async () => {
        // Arrange
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const activeUserId = 1n
        const mockSession = {
          sessionId: 'session123',
          activeUserId: 1n,
          sessionToken: 'token123',
          expiresAt: futureDate,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date(),
        }

        mockDb.session.findUnique.mockResolvedValue(mockSession)

        // Act
        const result = await repository.findByActiveUserId(activeUserId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.activeUserId).toBe(1n)
        }
        expect(mockDb.session.findUnique).toHaveBeenCalledWith({
          where: { activeUserId },
        })
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しないActiveUserIDの場合nullを返す', async () => {
        // Arrange
        const activeUserId = 999n
        mockDb.session.findUnique.mockResolvedValue(null)

        // Act
        const result = await repository.findByActiveUserId(activeUserId)

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
        mockDb.session.findUnique.mockRejectedValue(dbError)

        // Act
        const result = await repository.findByActiveUserId(activeUserId)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('update', () => {
    describe('基本動作', () => {
      it('Sessionを更新できる', async () => {
        // Arrange
        const sessionId = 'session123'
        const updates = {
          sessionToken: 'newToken456',
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        }

        const mockSession = {
          sessionId: 'session123',
          activeUserId: 1n,
          sessionToken: 'newToken456',
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date(),
        }

        mockDb.session.update.mockResolvedValue(mockSession)

        // Act
        const result = await repository.update(sessionId, updates)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.sessionToken).toBe('newToken456')
        }
        expect(mockDb.session.update).toHaveBeenCalledWith({
          where: { sessionId },
          data: updates,
        })
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const sessionId = 'session123'
        const updates = { sessionToken: 'newToken456' }
        const dbError = new Error('Database connection failed')
        mockDb.session.update.mockRejectedValue(dbError)

        // Act
        const result = await repository.update(sessionId, updates)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('delete', () => {
    describe('基本動作', () => {
      it('Sessionを削除できる', async () => {
        // Arrange
        const sessionId = 'session123'
        mockDb.session.delete.mockResolvedValue({} as any)

        // Act
        const result = await repository.delete(sessionId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeUndefined()
        }
        expect(mockDb.session.delete).toHaveBeenCalledWith({
          where: { sessionId },
        })
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const sessionId = 'session123'
        const dbError = new Error('Database connection failed')
        mockDb.session.delete.mockRejectedValue(dbError)

        // Act
        const result = await repository.delete(sessionId)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('deleteExpired', () => {
    describe('基本動作', () => {
      it('期限切れのSessionを削除できる', async () => {
        // Arrange
        const mockResult = { count: 5 }
        mockDb.session.deleteMany.mockResolvedValue(mockResult)

        // Act
        const result = await repository.deleteExpired()

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBe(5)
        }
        expect(mockDb.session.deleteMany).toHaveBeenCalledWith({
          where: {
            expiresAt: {
              lt: expect.any(Date),
            },
          },
        })
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const dbError = new Error('Database connection failed')
        mockDb.session.deleteMany.mockRejectedValue(dbError)

        // Act
        const result = await repository.deleteExpired()

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })
})
