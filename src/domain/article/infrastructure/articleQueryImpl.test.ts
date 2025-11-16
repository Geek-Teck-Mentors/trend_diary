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

        mockDb.$transaction.mockResolvedValue([2, mockArticles])

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

      it('タイトルでフィルタリングして記事を検索できる', async () => {
        // Arrange
        const params = {
          page: 1,
          limit: 20,
          title: 'TypeScript',
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
        const result = await queryImpl.searchArticles(params)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.data).toHaveLength(1)
          expect(result.data.total).toBe(1)
          expect(result.data.data[0].title).toContain('TypeScript')
        }
      })

      it('著者でフィルタリングして記事を検索できる', async () => {
        // Arrange
        const params = {
          page: 1,
          limit: 20,
          author: '山田',
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
        const result = await queryImpl.searchArticles(params)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.data).toHaveLength(1)
          expect(result.data.data[0].author).toContain('山田')
        }
      })

      it('メディアでフィルタリングして記事を検索できる', async () => {
        // Arrange
        const params = {
          page: 1,
          limit: 20,
          media: 'qiita' as const,
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
        const result = await queryImpl.searchArticles(params)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.data).toHaveLength(1)
          expect(result.data.data[0].media).toBe('Qiita')
        }
      })

      it('日付範囲でフィルタリングして記事を検索できる', async () => {
        // Arrange
        const params = {
          page: 1,
          limit: 20,
          from: '2024-01-14',
          to: '2024-01-15',
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
        const result = await queryImpl.searchArticles(params)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.data).toHaveLength(1)
        }
      })
    })

    describe('境界値・特殊値', () => {
      it('検索結果が0件の場合空の配列を返す', async () => {
        // Arrange
        const params = {
          page: 1,
          limit: 20,
          title: '存在しない記事',
        }

        mockDb.$transaction.mockResolvedValue([0, []])

        // Act
        const result = await queryImpl.searchArticles(params)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.data).toHaveLength(0)
          expect(result.data.total).toBe(0)
          expect(result.data.totalPages).toBe(0)
          expect(result.data.hasNext).toBe(false)
          expect(result.data.hasPrev).toBe(false)
        }
      })

      it('ページ2以降でhasNextとhasPrevが正しく設定される', async () => {
        // Arrange
        const params = {
          page: 2,
          limit: 20,
        }

        const mockArticles = [
          {
            articleId: 21n,
            media: 'Qiita',
            title: 'Page 2 Article',
            author: '山田太郎',
            description: '2ページ目の記事',
            url: 'https://example.com/article/21',
            createdAt: new Date('2024-01-15T09:30:00Z'),
          },
        ]

        mockDb.$transaction.mockResolvedValue([50, mockArticles])

        // Act
        const result = await queryImpl.searchArticles(params)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.page).toBe(2)
          expect(result.data.total).toBe(50)
          expect(result.data.totalPages).toBe(3)
          expect(result.data.hasNext).toBe(true)
          expect(result.data.hasPrev).toBe(true)
        }
      })

      it('最終ページでhasNextがfalseになる', async () => {
        // Arrange
        const params = {
          page: 3,
          limit: 20,
        }

        const mockArticles = [
          {
            articleId: 41n,
            media: 'Qiita',
            title: 'Last Page Article',
            author: '山田太郎',
            description: '最終ページの記事',
            url: 'https://example.com/article/41',
            createdAt: new Date('2024-01-15T09:30:00Z'),
          },
        ]

        mockDb.$transaction.mockResolvedValue([50, mockArticles])

        // Act
        const result = await queryImpl.searchArticles(params)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.page).toBe(3)
          expect(result.data.totalPages).toBe(3)
          expect(result.data.hasNext).toBe(false)
          expect(result.data.hasPrev).toBe(true)
        }
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
