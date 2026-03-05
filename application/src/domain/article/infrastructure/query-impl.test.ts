import { Article as PrismaArticle } from '@prisma/client'
import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it } from 'vitest'
import mockDb from '@/test/__mocks__/prisma'
import QueryImpl from './query-impl'

describe('QueryImpl', () => {
  let queryImpl: QueryImpl

  const mockArticles = [
    {
      articleId: 1n,
      media: 'qiita',
      title: 'TypeScriptの型安全性について',
      author: '山田太郎',
      description: 'TypeScriptの型安全性に関する解説記事です',
      url: 'https://example.com/article/1',
      createdAt: new Date('2024-01-15T09:30:00Z'),
    },
    {
      articleId: 2n,
      media: 'zenn',
      title: 'Reactのフック活用法',
      author: '佐藤花子',
      description: 'Reactのフックについて詳しく解説します',
      url: 'https://example.com/article/2',
      createdAt: new Date('2024-01-14T10:00:00Z'),
    },
  ]

  beforeEach(() => {
    queryImpl = new QueryImpl(mockDb)
  })

  describe('searchArticles', () => {
    it('ページネーション付きで記事を検索できる', async () => {
      mockDb.$queryRaw.mockResolvedValueOnce([{ total: 2 }]).mockResolvedValueOnce([
        {
          articleId: 1,
          media: 'qiita',
          title: 'TypeScriptの型安全性について',
          author: '山田太郎',
          description: 'TypeScriptの型安全性に関する解説記事です',
          url: 'https://example.com/article/1',
          createdAt: '2024-01-15T09:30:00.000Z',
          isRead: null,
        },
        {
          articleId: 2,
          media: 'zenn',
          title: 'Reactのフック活用法',
          author: '佐藤花子',
          description: 'Reactのフックについて詳しく解説します',
          url: 'https://example.com/article/2',
          createdAt: '2024-01-14T10:00:00.000Z',
          isRead: null,
        },
      ])

      const result = await queryImpl.searchArticles({ page: 1, limit: 20 })

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.total).toBe(2)
        expect(result.data.data).toHaveLength(2)
        expect(result.data.data[0].isRead).toBeUndefined()
      }
    })

    it('activeUserId指定時は既読状態を返す', async () => {
      mockDb.$queryRaw.mockResolvedValueOnce([{ total: 2 }]).mockResolvedValueOnce([
        {
          articleId: 1n,
          media: 'qiita',
          title: 'TypeScriptの型安全性について',
          author: '山田太郎',
          description: 'TypeScriptの型安全性に関する解説記事です',
          url: 'https://example.com/article/1',
          createdAt: new Date('2024-01-15T09:30:00Z'),
          isRead: 1,
        },
        {
          articleId: 2n,
          media: 'zenn',
          title: 'Reactのフック活用法',
          author: '佐藤花子',
          description: 'Reactのフックについて詳しく解説します',
          url: 'https://example.com/article/2',
          createdAt: new Date('2024-01-14T10:00:00Z'),
          isRead: 0,
        },
      ])

      const result = await queryImpl.searchArticles({ page: 1, limit: 20 }, 10n)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.data[0].isRead).toBe(true)
        expect(result.data.data[1].isRead).toBe(false)
      }
    })

    it('件数取得失敗時はエラーを返す', async () => {
      mockDb.$queryRaw.mockRejectedValue(new Error('count failed'))

      const result = await queryImpl.searchArticles({ page: 1, limit: 20 })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.message).toBe('count failed')
      }
    })

    it('from/to指定時は取得後に日付で絞り込みできる', async () => {
      mockDb.$queryRaw.mockResolvedValueOnce([{ total: 2 }]).mockResolvedValueOnce([
        {
          articleId: 1,
          media: 'qiita',
          title: '対象記事1',
          author: '山田',
          description: '当日の記事1',
          url: 'https://example.com/article/1',
          createdAt: '2026-03-04T15:00:00.000Z',
        },
        {
          articleId: 2,
          media: 'zenn',
          title: '対象記事2',
          author: '鈴木',
          description: '当日の記事2',
          url: 'https://example.com/article/2',
          createdAt: '2026-03-05T14:59:59.999Z',
        },
      ])

      const result = await queryImpl.searchArticles({
        page: 1,
        limit: 20,
        from: '2026-03-05',
        to: '2026-03-05',
      })

      expect(isSuccess(result)).toBe(true)
      expect(mockDb.article.count).not.toHaveBeenCalled()
      expect(mockDb.article.findMany).not.toHaveBeenCalled()
      expect(mockDb.$queryRaw).toHaveBeenCalledTimes(2)

      if (isSuccess(result)) {
        expect(result.data.total).toBe(2)
        expect(result.data.data).toHaveLength(2)
        expect(result.data.data[0].title).toBe('対象記事1')
        expect(result.data.data[1].title).toBe('対象記事2')
      }
    })
  })

  describe('findArticleById', () => {
    it('記事をIDで検索できる', async () => {
      mockDb.article.findUnique.mockResolvedValue(mockArticles[0] as unknown as PrismaArticle)

      const result = await queryImpl.findArticleById(1n)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data?.articleId).toBe(1n)
      }
    })
  })
})
