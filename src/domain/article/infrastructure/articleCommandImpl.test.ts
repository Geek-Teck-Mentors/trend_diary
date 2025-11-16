import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it } from 'vitest'
import mockDb from '@/test/__mocks__/prisma'
import ArticleCommandImpl from './articleCommandImpl'

describe('ArticleCommandImpl', () => {
  let commandImpl: ArticleCommandImpl

  beforeEach(() => {
    commandImpl = new ArticleCommandImpl(mockDb)
  })

  describe('createReadHistory', () => {
    describe('基本動作', () => {
      it('正しい引数でデータベース作成関数を呼び出す', async () => {
        // Arrange
        const activeUserId = 1n
        const articleId = 100n
        const readAt = new Date('2024-01-15T09:30:00Z')
        mockDb.readHistory.create.mockResolvedValue({
          readHistoryId: 1n,
          activeUserId,
          articleId,
          readAt,
          createdAt: new Date('2024-01-15T09:30:00Z'),
        })

        // Act
        await commandImpl.createReadHistory(activeUserId, articleId, readAt)

        // Assert
        expect(mockDb.readHistory.create).toHaveBeenCalledWith({
          data: { activeUserId, articleId, readAt },
        })
      })

      const basicTestCases = [
        {
          name: '読み履歴を作成できる',
          activeUserId: 1n,
          articleId: 100n,
          readAt: new Date('2024-01-15T09:30:00Z'),
          readHistoryId: 1n,
          createdAt: new Date('2024-01-15T09:30:00Z'),
        },
        {
          name: '異なるユーザーの読み履歴を作成できる',
          activeUserId: 2n,
          articleId: 200n,
          readAt: new Date('2024-01-16T10:00:00Z'),
          readHistoryId: 2n,
          createdAt: new Date('2024-01-16T10:00:00Z'),
        },
      ]

      basicTestCases.forEach(
        ({ name, activeUserId, articleId, readAt, readHistoryId, createdAt }) => {
          it(name, async () => {
            // Arrange
            const mockReadHistory = {
              readHistoryId,
              activeUserId,
              articleId,
              readAt,
              createdAt,
            }

            mockDb.readHistory.create.mockResolvedValue(mockReadHistory)

            // Act
            const result = await commandImpl.createReadHistory(activeUserId, articleId, readAt)

            // Assert
            expect(isSuccess(result)).toBe(true)
            if (isSuccess(result)) {
              expect(result.data.readHistoryId).toBe(readHistoryId)
              expect(result.data.activeUserId).toBe(activeUserId)
              expect(result.data.articleId).toBe(articleId)
              expect(result.data.readAt).toEqual(readAt)
            }
          })
        },
      )
    })

    describe('境界値・特殊値', () => {
      const boundaryTestCases = [
        {
          name: '最小のbigint値で読み履歴を作成できる',
          activeUserId: 0n,
          articleId: 0n,
          readAt: new Date('2024-01-15T09:30:00Z'),
          readHistoryId: 0n,
        },
        {
          name: '非常に大きなbigint値で読み履歴を作成できる',
          activeUserId: 9223372036854775806n,
          articleId: 9223372036854775805n,
          readAt: new Date('2024-01-15T09:30:00Z'),
          readHistoryId: 9223372036854775807n,
        },
        {
          name: 'Unix epoch日時で読み履歴を作成できる',
          activeUserId: 1n,
          articleId: 100n,
          readAt: new Date('1970-01-01T00:00:00.000Z'),
          readHistoryId: 1n,
        },
        {
          name: '遠い未来の日時で読み履歴を作成できる',
          activeUserId: 1n,
          articleId: 100n,
          readAt: new Date('2099-12-31T23:59:59.999Z'),
          readHistoryId: 1n,
        },
      ]

      boundaryTestCases.forEach(({ name, activeUserId, articleId, readAt, readHistoryId }) => {
        it(name, async () => {
          // Arrange
          const mockReadHistory = {
            readHistoryId,
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
            expect(result.data.readHistoryId).toBe(readHistoryId)
            expect(result.data.activeUserId).toBe(activeUserId)
            expect(result.data.articleId).toBe(articleId)
            expect(result.data.readAt).toEqual(readAt)
          }
        })
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
      it('正しい引数でデータベース削除関数を呼び出す', async () => {
        // Arrange
        const activeUserId = 1n
        const articleId = 100n
        mockDb.readHistory.deleteMany.mockResolvedValue({ count: 5 })

        // Act
        await commandImpl.deleteAllReadHistory(activeUserId, articleId)

        // Assert
        expect(mockDb.readHistory.deleteMany).toHaveBeenCalledWith({
          where: { activeUserId, articleId },
        })
      })

      const basicTestCases = [
        {
          name: '特定ユーザーの特定記事の読み履歴を全て削除できる',
          activeUserId: 1n,
          articleId: 100n,
          count: 5,
        },
        {
          name: '異なるユーザーと記事の組み合わせで削除できる',
          activeUserId: 2n,
          articleId: 200n,
          count: 3,
        },
      ]

      basicTestCases.forEach(({ name, activeUserId, articleId, count }) => {
        it(name, async () => {
          // Arrange
          mockDb.readHistory.deleteMany.mockResolvedValue({ count })

          // Act
          const result = await commandImpl.deleteAllReadHistory(activeUserId, articleId)

          // Assert
          expect(isSuccess(result)).toBe(true)
          if (isSuccess(result)) {
            expect(result.data).toBeUndefined()
          }
        })
      })
    })

    describe('境界値・特殊値', () => {
      const boundaryTestCases = [
        {
          name: '最小のbigint値で削除できる',
          activeUserId: 0n,
          articleId: 0n,
          count: 1,
        },
        {
          name: '非常に大きなbigint値で削除できる',
          activeUserId: 9223372036854775806n,
          articleId: 9223372036854775805n,
          count: 2,
        },
        {
          name: '削除対象が0件でも正常に完了する',
          activeUserId: 999n,
          articleId: 999n,
          count: 0,
        },
      ]

      boundaryTestCases.forEach(({ name, activeUserId, articleId, count }) => {
        it(name, async () => {
          // Arrange
          mockDb.readHistory.deleteMany.mockResolvedValue({ count })

          // Act
          const result = await commandImpl.deleteAllReadHistory(activeUserId, articleId)

          // Assert
          expect(isSuccess(result)).toBe(true)
          if (isSuccess(result)) {
            expect(result.data).toBeUndefined()
          }
        })
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
