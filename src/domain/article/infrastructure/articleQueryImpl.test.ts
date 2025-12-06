import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it } from 'vitest'
import mockDb from '@/test/__mocks__/prisma'
import ArticleQueryImpl from './articleQueryImpl'

describe('ArticleQueryImpl', () => {
  let queryImpl: ArticleQueryImpl

  beforeEach(() => {
    queryImpl = new ArticleQueryImpl(mockDb)
  })

  describe('searchArticles', () => {
    describe('基本動作', () => {
      it('記事を検索できる（ページネーション付き）', async () => {
        // Arrange
        const params = {
          page: 1,
          limit: 20,
        }

        const multipleMockArticles = [
          {
            articleId: 1n,
            media: 'Qiita',
            title: 'TypeScriptの型安全性について',
            author: '山田太郎',
            description: 'TypeScriptの型安全性に関する解説記事です',
            url: 'https://example.com/article/1',
            createdAt: new Date('2024-01-15T09:30:00Z'),
          },
          {
            articleId: 2n,
            media: 'Zenn',
            title: 'Reactのフック活用法',
            author: '佐藤花子',
            description: 'Reactのフックについて詳しく解説します',
            url: 'https://example.com/article/2',
            createdAt: new Date('2024-01-14T10:00:00Z'),
          },
        ]

        mockDb.$transaction.mockResolvedValue([2, multipleMockArticles])

        // Act
        const result = await queryImpl.searchArticles(params)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.data).toHaveLength(2)
          expect(result.data.page).toBe(1)
          expect(result.data.limit).toBe(20)
          expect(result.data.total).toBe(2)
          expect(result.data.totalPages).toBe(1)
          expect(result.data.hasNext).toBe(false)
          expect(result.data.hasPrev).toBe(false)
          expect(result.data.data[0].articleId).toBe(1n)
          expect(result.data.data[0].title).toBe('TypeScriptの型安全性について')
        }
        expect(mockDb.$transaction).toHaveBeenCalled()
      })

      const singleMockArticle = [
        {
          articleId: 1n,
          media: 'Qiita',
          title: 'TypeScriptの型安全性について',
          author: '山田太郎',
          description: 'TypeScriptの型安全性に関する解説記事です',
          url: 'https://example.com/article/1',
          createdAt: new Date('2024-01-15T09:30:00Z'),
        },
      ]

      const filterTestCases = [
        {
          name: 'タイトルでフィルタリングして記事を検索できる',
          params: {
            page: 1,
            limit: 20,
            title: 'TypeScript',
          },
          assertion: (result: typeof singleMockArticle) => {
            expect(result[0].title).toContain('TypeScript')
          },
        },
        {
          name: '著者でフィルタリングして記事を検索できる',
          params: {
            page: 1,
            limit: 20,
            author: '山田',
          },
          assertion: (result: typeof singleMockArticle) => {
            expect(result[0].author).toContain('山田')
          },
        },
        {
          name: 'メディアでフィルタリングして記事を検索できる',
          params: {
            page: 1,
            limit: 20,
            media: 'qiita' as const,
          },
          assertion: (result: typeof singleMockArticle) => {
            expect(result[0].media).toBe('Qiita')
          },
        },
        {
          name: '日付範囲でフィルタリングして記事を検索できる',
          params: {
            page: 1,
            limit: 20,
            from: '2024-01-14',
            to: '2024-01-15',
          },
          assertion: () => {
            // 日付範囲のテストは記事が返されることを確認するだけ
          },
        },
      ]

      filterTestCases.forEach(({ name, params, assertion }) => {
        it(name, async () => {
          // Arrange
          mockDb.$transaction.mockResolvedValue([1, singleMockArticle])

          // Act
          const result = await queryImpl.searchArticles(params)

          // Assert
          expect(isSuccess(result)).toBe(true)
          if (isSuccess(result)) {
            expect(result.data.data).toHaveLength(1)
            expect(result.data.total).toBe(1)
            assertion(result.data.data)
          }
        })
      })
    })

    describe('境界値・特殊値', () => {
      const paginationTestCases = [
        {
          name: '検索結果が0件の場合空の配列を返す',
          params: { page: 1, limit: 20, title: '存在しない記事' },
          total: 0,
          mockArticles: [],
          expected: {
            dataLength: 0,
            page: 1,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
        {
          name: 'ページ2以降でhasNextとhasPrevが正しく設定される',
          params: { page: 2, limit: 20 },
          total: 50,
          mockArticles: [
            {
              articleId: 21n,
              media: 'Qiita',
              title: 'Page 2 Article',
              author: '山田太郎',
              description: '2ページ目の記事',
              url: 'https://example.com/article/21',
              createdAt: new Date('2024-01-15T09:30:00Z'),
            },
          ],
          expected: {
            dataLength: 1,
            page: 2,
            total: 50,
            totalPages: 3,
            hasNext: true,
            hasPrev: true,
          },
        },
        {
          name: '最終ページでhasNextがfalseになる',
          params: { page: 3, limit: 20 },
          total: 50,
          mockArticles: [
            {
              articleId: 41n,
              media: 'Qiita',
              title: 'Last Page Article',
              author: '山田太郎',
              description: '最終ページの記事',
              url: 'https://example.com/article/41',
              createdAt: new Date('2024-01-15T09:30:00Z'),
            },
          ],
          expected: {
            dataLength: 1,
            page: 3,
            total: 50,
            totalPages: 3,
            hasNext: false,
            hasPrev: true,
          },
        },
      ]

      paginationTestCases.forEach(({ name, params, total, mockArticles, expected }) => {
        it(name, async () => {
          // Arrange
          mockDb.$transaction.mockResolvedValue([total, mockArticles])

          // Act
          const result = await queryImpl.searchArticles(params)

          // Assert
          expect(isSuccess(result)).toBe(true)
          if (isSuccess(result)) {
            expect(result.data.data).toHaveLength(expected.dataLength)
            expect(result.data.page).toBe(expected.page)
            expect(result.data.total).toBe(expected.total)
            expect(result.data.totalPages).toBe(expected.totalPages)
            expect(result.data.hasNext).toBe(expected.hasNext)
            expect(result.data.hasPrev).toBe(expected.hasPrev)
          }
        })
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const params = {
          page: 1,
          limit: 20,
        }
        const dbError = new Error('Database connection failed')
        mockDb.$transaction.mockRejectedValue(dbError)

        // Act
        const result = await queryImpl.searchArticles(params)

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('searchArticles with activeUserId', () => {
    const activeUserId = 1n

    describe('基本動作', () => {
      it('activeUserIdを渡すと既読情報付きで記事を検索できる', async () => {
        // Arrange
        const params = {
          page: 1,
          limit: 20,
        }

        const mockArticles = [
          {
            articleId: 1n,
            media: 'Qiita',
            title: 'TypeScriptの型安全性について',
            author: '山田太郎',
            description: 'TypeScriptの型安全性に関する解説記事です',
            url: 'https://example.com/article/1',
            createdAt: new Date('2024-01-15T09:30:00Z'),
          },
          {
            articleId: 2n,
            media: 'Zenn',
            title: 'Reactのフック活用法',
            author: '佐藤花子',
            description: 'Reactのフックについて詳しく解説します',
            url: 'https://example.com/article/2',
            createdAt: new Date('2024-01-14T10:00:00Z'),
          },
        ]

        const mockReadHistories = [
          {
            readHistoryId: 1n,
            activeUserId: 1n,
            articleId: 1n,
            readAt: new Date('2024-01-16T09:00:00Z'),
            createdAt: new Date('2024-01-16T09:00:00Z'),
          },
        ]

        mockDb.$transaction.mockResolvedValue([2, mockArticles])
        mockDb.readHistory.findMany.mockResolvedValue(mockReadHistories)

        // Act
        const result = await queryImpl.searchArticles(params, activeUserId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.data).toHaveLength(2)
          expect(result.data.data[0].isRead).toBe(true) // articleId: 1は既読
          expect(result.data.data[1].isRead).toBe(false) // articleId: 2は未読
        }
      })

      it('activeUserIdを渡さないとisReadがundefinedになる', async () => {
        // Arrange
        const params = {
          page: 1,
          limit: 20,
        }

        const mockArticles = [
          {
            articleId: 1n,
            media: 'Qiita',
            title: 'TypeScriptの型安全性について',
            author: '山田太郎',
            description: 'TypeScriptの型安全性に関する解説記事です',
            url: 'https://example.com/article/1',
            createdAt: new Date('2024-01-15T09:30:00Z'),
          },
        ]

        mockDb.$transaction.mockResolvedValue([1, mockArticles])

        // Act
        const result = await queryImpl.searchArticles(params) // activeUserIdなし

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.data).toHaveLength(1)
          expect(result.data.data[0].isRead).toBeUndefined()
        }
      })

      it('既読履歴がない場合は全てisRead: falseになる', async () => {
        // Arrange
        const params = {
          page: 1,
          limit: 20,
        }

        const mockArticles = [
          {
            articleId: 1n,
            media: 'Qiita',
            title: 'TypeScriptの型安全性について',
            author: '山田太郎',
            description: 'TypeScriptの型安全性に関する解説記事です',
            url: 'https://example.com/article/1',
            createdAt: new Date('2024-01-15T09:30:00Z'),
          },
        ]

        mockDb.$transaction.mockResolvedValue([1, mockArticles])
        mockDb.readHistory.findMany.mockResolvedValue([])

        // Act
        const result = await queryImpl.searchArticles(params, activeUserId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.data).toHaveLength(1)
          expect(result.data.data[0].isRead).toBe(false)
        }
      })
    })

    describe('例外・制約違反', () => {
      it('既読履歴取得時のデータベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const params = {
          page: 1,
          limit: 20,
        }
        const mockArticles = [
          {
            articleId: 1n,
            media: 'Qiita',
            title: 'TypeScriptの型安全性について',
            author: '山田太郎',
            description: 'TypeScriptの型安全性に関する解説記事です',
            url: 'https://example.com/article/1',
            createdAt: new Date('2024-01-15T09:30:00Z'),
          },
        ]
        const dbError = new Error('ReadHistory connection failed')
        mockDb.$transaction.mockResolvedValue([1, mockArticles])
        mockDb.readHistory.findMany.mockRejectedValue(dbError)

        // Act
        const result = await queryImpl.searchArticles(params, activeUserId)

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error.message).toBe('ReadHistory connection failed')
        }
      })
    })
  })

  describe('findArticleById', () => {
    describe('基本動作', () => {
      it('記事をIDで検索できる', async () => {
        // Arrange
        const articleId = 1n

        const mockArticle = {
          articleId: 1n,
          media: 'Qiita',
          title: 'TypeScriptの型安全性について',
          author: '山田太郎',
          description: 'TypeScriptの型安全性に関する解説記事です',
          url: 'https://example.com/article/1',
          createdAt: new Date('2024-01-15T09:30:00Z'),
        }

        mockDb.article.findUnique.mockResolvedValue(mockArticle)

        // Act
        const result = await queryImpl.findArticleById(articleId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.articleId).toBe(1n)
          expect(result.data?.title).toBe('TypeScriptの型安全性について')
        }
        expect(mockDb.article.findUnique).toHaveBeenCalledWith({
          where: { articleId },
        })
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しない記事IDの場合nullを返す', async () => {
        // Arrange
        const articleId = 999n
        mockDb.article.findUnique.mockResolvedValue(null)

        // Act
        const result = await queryImpl.findArticleById(articleId)

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
        const articleId = 1n
        const dbError = new Error('Database connection failed')
        mockDb.article.findUnique.mockRejectedValue(dbError)

        // Act
        const result = await queryImpl.findArticleById(articleId)

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })
})
