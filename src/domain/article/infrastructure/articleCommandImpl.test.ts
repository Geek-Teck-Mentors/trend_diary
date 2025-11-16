import { PrismaClient } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import ArticleCommandImpl from './articleCommandImpl'

// モックの設定
const mockDb = mockDeep<PrismaClient>()

describe('ArticleCommandImpl', () => {
  let commandImpl: ArticleCommandImpl

  beforeEach(() => {
    vi.clearAllMocks()
    commandImpl = new ArticleCommandImpl(mockDb)
  })

  describe('createReadHistory', () => {
    describe('基本動作', () => {
      it('読み履歴を作成できる', async () => {
        // Arrange
        const activeUserId = 1n
        const articleId = 100n
        const readAt = new Date('2024-01-15T09:30:00Z')

        const mockReadHistory = {
          readHistoryId: 1n,
          activeUserId,
          articleId,
          readAt,
          createdAt: new Date('2024-01-15T09:30:00Z'),
        }

        mockDb.readHistory.create.mockResolvedValue(mockReadHistory)

        // Act
        const result = await commandImpl.createReadHistory(activeUserId, articleId, readAt)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.readHistoryId).toBe(1n)
          expect(result.data.activeUserId).toBe(activeUserId)
          expect(result.data.articleId).toBe(articleId)
          expect(result.data.readAt).toEqual(readAt)
        }
        expect(mockDb.readHistory.create).toHaveBeenCalledWith({
          data: {
            activeUserId,
            articleId,
            readAt,
          },
        })
      })

      it('異なるユーザーの読み履歴を作成できる', async () => {
        // Arrange
        const activeUserId = 2n
        const articleId = 200n
        const readAt = new Date('2024-01-16T10:00:00Z')

        const mockReadHistory = {
          readHistoryId: 2n,
          activeUserId,
          articleId,
          readAt,
          createdAt: new Date('2024-01-16T10:00:00Z'),
        }

        mockDb.readHistory.create.mockResolvedValue(mockReadHistory)

        // Act
        const result = await commandImpl.createReadHistory(activeUserId, articleId, readAt)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.activeUserId).toBe(activeUserId)
          expect(result.data.articleId).toBe(articleId)
        }
      })
    })

    describe('境界値・特殊値', () => {
      it('最小のbigint値で読み履歴を作成できる', async () => {
        // Arrange
        const activeUserId = 0n
        const articleId = 0n
        const readAt = new Date('2024-01-15T09:30:00Z')

        const mockReadHistory = {
          readHistoryId: 0n,
          activeUserId,
          articleId,
          readAt,
          createdAt: new Date('2024-01-15T09:30:00Z'),
        }

        mockDb.readHistory.create.mockResolvedValue(mockReadHistory)

        // Act
        const result = await commandImpl.createReadHistory(activeUserId, articleId, readAt)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.activeUserId).toBe(0n)
          expect(result.data.articleId).toBe(0n)
        }
      })

      it('非常に大きなbigint値で読み履歴を作成できる', async () => {
        // Arrange
        const activeUserId = 9223372036854775806n
        const articleId = 9223372036854775805n
        const readAt = new Date('2024-01-15T09:30:00Z')

        const mockReadHistory = {
          readHistoryId: 9223372036854775807n,
          activeUserId,
          articleId,
          readAt,
          createdAt: new Date('2024-01-15T09:30:00Z'),
        }

        mockDb.readHistory.create.mockResolvedValue(mockReadHistory)

        // Act
        const result = await commandImpl.createReadHistory(activeUserId, articleId, readAt)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.activeUserId).toBe(activeUserId)
          expect(result.data.articleId).toBe(articleId)
        }
      })

      it('Unix epoch日時で読み履歴を作成できる', async () => {
        // Arrange
        const activeUserId = 1n
        const articleId = 100n
        const readAt = new Date('1970-01-01T00:00:00.000Z')

        const mockReadHistory = {
          readHistoryId: 1n,
          activeUserId,
          articleId,
          readAt,
          createdAt: new Date('2024-01-15T09:30:00Z'),
        }

        mockDb.readHistory.create.mockResolvedValue(mockReadHistory)

        // Act
        const result = await commandImpl.createReadHistory(activeUserId, articleId, readAt)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.readAt).toEqual(readAt)
        }
      })

      it('遠い未来の日時で読み履歴を作成できる', async () => {
        // Arrange
        const activeUserId = 1n
        const articleId = 100n
        const readAt = new Date('2099-12-31T23:59:59.999Z')

        const mockReadHistory = {
          readHistoryId: 1n,
          activeUserId,
          articleId,
          readAt,
          createdAt: new Date('2024-01-15T09:30:00Z'),
        }

        mockDb.readHistory.create.mockResolvedValue(mockReadHistory)

        // Act
        const result = await commandImpl.createReadHistory(activeUserId, articleId, readAt)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.readAt).toEqual(readAt)
        }
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const activeUserId = 1n
        const articleId = 100n
        const readAt = new Date('2024-01-15T09:30:00Z')
        const dbError = new Error('Database connection failed')
        mockDb.readHistory.create.mockRejectedValue(dbError)

        // Act
        const result = await commandImpl.createReadHistory(activeUserId, articleId, readAt)

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('deleteAllReadHistory', () => {
    describe('基本動作', () => {
      it('特定ユーザーの特定記事の読み履歴を全て削除できる', async () => {
        // Arrange
        const activeUserId = 1n
        const articleId = 100n

        mockDb.readHistory.deleteMany.mockResolvedValue({ count: 5 })

        // Act
        const result = await commandImpl.deleteAllReadHistory(activeUserId, articleId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeUndefined()
        }
        expect(mockDb.readHistory.deleteMany).toHaveBeenCalledWith({
          where: {
            activeUserId,
            articleId,
          },
        })
      })

      it('異なるユーザーと記事の組み合わせで削除できる', async () => {
        // Arrange
        const activeUserId = 2n
        const articleId = 200n

        mockDb.readHistory.deleteMany.mockResolvedValue({ count: 3 })

        // Act
        const result = await commandImpl.deleteAllReadHistory(activeUserId, articleId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeUndefined()
        }
      })
    })

    describe('境界値・特殊値', () => {
      it('最小のbigint値で削除できる', async () => {
        // Arrange
        const activeUserId = 0n
        const articleId = 0n

        mockDb.readHistory.deleteMany.mockResolvedValue({ count: 1 })

        // Act
        const result = await commandImpl.deleteAllReadHistory(activeUserId, articleId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeUndefined()
        }
      })

      it('非常に大きなbigint値で削除できる', async () => {
        // Arrange
        const activeUserId = 9223372036854775806n
        const articleId = 9223372036854775805n

        mockDb.readHistory.deleteMany.mockResolvedValue({ count: 2 })

        // Act
        const result = await commandImpl.deleteAllReadHistory(activeUserId, articleId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeUndefined()
        }
      })

      it('削除対象が0件でも正常に完了する', async () => {
        // Arrange
        const activeUserId = 999n
        const articleId = 999n

        mockDb.readHistory.deleteMany.mockResolvedValue({ count: 0 })

        // Act
        const result = await commandImpl.deleteAllReadHistory(activeUserId, articleId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeUndefined()
        }
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const activeUserId = 1n
        const articleId = 100n
        const dbError = new Error('Database connection failed')
        mockDb.readHistory.deleteMany.mockRejectedValue(dbError)

        // Act
        const result = await commandImpl.deleteAllReadHistory(activeUserId, articleId)

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })
})
