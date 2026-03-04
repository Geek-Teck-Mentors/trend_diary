import { Article as PrismaArticle, ReadHistory as PrismaReadHistory } from '@prisma/client'
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
      mockDb.article.count.mockResolvedValue(2)
      mockDb.article.findMany.mockResolvedValue(mockArticles as unknown as PrismaArticle[])

      const result = await queryImpl.searchArticles({ page: 1, limit: 20 })

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.total).toBe(2)
        expect(result.data.data).toHaveLength(2)
        expect(result.data.data[0].isRead).toBeUndefined()
      }
    })

    it('activeUserId指定時は既読状態を返す', async () => {
      mockDb.article.count.mockResolvedValue(2)
      mockDb.article.findMany.mockResolvedValue(mockArticles as unknown as PrismaArticle[])
      mockDb.readHistory.findMany.mockResolvedValue([
        {
          readHistoryId: 1n,
          articleId: 1n,
          activeUserId: 10n,
          readAt: new Date('2024-01-20T00:00:00Z'),
          createdAt: new Date('2024-01-20T00:00:00Z'),
        },
      ] as unknown as PrismaReadHistory[])

      const result = await queryImpl.searchArticles({ page: 1, limit: 20 }, 10n)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.data[0].isRead).toBe(true)
        expect(result.data.data[1].isRead).toBe(false)
      }
    })

    it('件数取得失敗時はエラーを返す', async () => {
      mockDb.article.count.mockRejectedValue(new Error('count failed'))

      const result = await queryImpl.searchArticles({ page: 1, limit: 20 })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.message).toBe('count failed')
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
