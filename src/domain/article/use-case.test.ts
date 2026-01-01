import { faker } from '@faker-js/faker'
import { failure, isFailure, isSuccess, success } from '@yuukihayashi0510/core'
import { mockDeep } from 'vitest-mock-extended'
import { NotFoundError, ServerError } from '@/common/errors'
import { OffsetPaginationResult } from '@/common/pagination'
import { ArticleCommand, ArticleQuery } from '@/domain/article/repository'
import { ArticleQueryParams } from '@/domain/article/schema/article-query-schema'
import type { Article, ArticleWithOptionalReadStatus } from '@/domain/article/schema/article-schema'
import type { ReadHistory } from '@/domain/article/schema/read-history-schema'
import { UseCase } from './use-case'

const mockArticle: Article = {
  articleId: BigInt(1),
  media: 'qiita',
  title: faker.lorem.sentence(),
  author: faker.person.fullName(),
  description: faker.lorem.paragraph(),
  url: faker.internet.url(),
  createdAt: new Date(),
}

const mockPaginationResult: OffsetPaginationResult<ArticleWithOptionalReadStatus> = {
  data: [mockArticle],
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
}

const mockPaginationResultWithReadStatus: OffsetPaginationResult<ArticleWithOptionalReadStatus> = {
  data: [{ ...mockArticle, isRead: true }],
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
}

const mockArticleQuery = mockDeep<ArticleQuery>()
const mockArticleCommand = mockDeep<ArticleCommand>()

describe('ArticleUseCase', () => {
  const useCase = new UseCase(mockArticleQuery, mockArticleCommand)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchArticles', () => {
    describe('正常系', () => {
      it('有効なパラメータで記事検索成功', async () => {
        const params: ArticleQueryParams = {
          title: 'test title',
          author: 'test author',
          media: 'qiita',
          from: '2024-01-01',
          to: '2024-01-31',
          readStatus: false,
          limit: 20,
          page: 1,
        }

        mockArticleQuery.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(mockArticleQuery.searchArticles).toHaveBeenCalledTimes(1)
        const calledArgs = mockArticleQuery.searchArticles.mock.calls[0][0]
        expect(calledArgs).toEqual(params)
      })

      it('全てのパラメータが含まれるfrom/to検索', async () => {
        const params: ArticleQueryParams = {
          title: 'test title',
          author: 'test author',
          media: 'qiita',
          from: '2024-01-01',
          to: '2024-01-31',
          readStatus: false,
          limit: 10,
          page: 2,
        }

        mockArticleQuery.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(mockArticleQuery.searchArticles).toHaveBeenCalledTimes(1)
        const calledArgs = mockArticleQuery.searchArticles.mock.calls[0][0]
        expect(calledArgs).toEqual(params)
      })

      it('titleパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          title: 'test title',
          limit: 20,
          page: 1,
        }

        mockArticleQuery.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(mockArticleQuery.searchArticles).toHaveBeenCalledWith(
          {
            title: 'test title',
            limit: 20,
            page: 1,
          },
          undefined,
        )
      })

      it('authorパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          author: 'test author',
          limit: 20,
          page: 1,
        }

        mockArticleQuery.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(mockArticleQuery.searchArticles).toHaveBeenCalledWith(
          {
            author: 'test author',
            limit: 20,
            page: 1,
          },
          undefined,
        )
      })

      it('mediaパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          media: 'zenn',
          limit: 20,
          page: 1,
        }

        mockArticleQuery.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(mockArticleQuery.searchArticles).toHaveBeenCalledWith(
          {
            media: 'zenn',
            limit: 20,
            page: 1,
          },
          undefined,
        )
      })

      it('fromパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          from: '2024-01-01',
          limit: 20,
          page: 1,
        }

        mockArticleQuery.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(mockArticleQuery.searchArticles).toHaveBeenCalledWith(
          {
            from: '2024-01-01',
            limit: 20,
            page: 1,
          },
          undefined,
        )
      })

      it('toパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          to: '2024-01-31',
          limit: 20,
          page: 1,
        }

        mockArticleQuery.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(mockArticleQuery.searchArticles).toHaveBeenCalledWith(
          {
            to: '2024-01-31',
            limit: 20,
            page: 1,
          },
          undefined,
        )
      })

      it('from/toパラメータの組み合わせで検索', async () => {
        const params: ArticleQueryParams = {
          from: '2024-01-01',
          to: '2024-01-31',
          limit: 20,
          page: 1,
        }

        mockArticleQuery.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(mockArticleQuery.searchArticles).toHaveBeenCalledWith(
          {
            from: '2024-01-01',
            to: '2024-01-31',
            limit: 20,
            page: 1,
          },
          undefined,
        )
      })

      it('readStatusパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          readStatus: true,
          limit: 20,
          page: 1,
        }

        mockArticleQuery.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(mockArticleQuery.searchArticles).toHaveBeenCalledWith(
          {
            readStatus: true,
            limit: 20,
            page: 1,
          },
          undefined,
        )
      })

      it('activeUserIdを渡すと既読情報付きで記事検索成功', async () => {
        const params: ArticleQueryParams = {
          limit: 20,
          page: 1,
        }
        const activeUserId = 100n

        mockArticleQuery.searchArticles.mockResolvedValue(
          success(mockPaginationResultWithReadStatus),
        )

        const result = await useCase.searchArticles(params, activeUserId)

        expect(result).toEqual(success(mockPaginationResultWithReadStatus))
        expect(mockArticleQuery.searchArticles).toHaveBeenCalledWith(
          {
            limit: 20,
            page: 1,
          },
          activeUserId,
        )
      })
    })

    it('異常系: リポジトリ層でのDBエラー', async () => {
      const params: ArticleQueryParams = {
        title: 'test title',
        limit: 20,
        page: 1,
      }

      const dbError = new ServerError('Database error')
      mockArticleQuery.searchArticles.mockResolvedValue(failure(dbError))

      const result = await useCase.searchArticles(params)

      expect(result).toEqual(failure(dbError))
    })
  })

  describe('createReadHistory', () => {
    it('正常にReadHistoryを作成できること', async () => {
      const userId = 100n
      const articleId = 200n
      const readAt = new Date('2024-01-01T10:00:00Z')

      // 記事存在確認のモック
      mockArticleQuery.findArticleById.mockResolvedValue(success(mockArticle))

      const mockReadHistory: ReadHistory = {
        readHistoryId: 1n,
        activeUserId: userId,
        articleId: articleId,
        readAt: readAt,
        createdAt: new Date(),
      }
      mockArticleCommand.createReadHistory.mockResolvedValue(success(mockReadHistory))

      const result = await useCase.createReadHistory(userId, articleId, readAt)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.activeUserId).toBe(userId)
        expect(result.data.articleId).toBe(articleId)
        expect(result.data.readAt).toBe(readAt)
      }

      expect(mockArticleQuery.findArticleById).toHaveBeenCalledWith(articleId)
      expect(mockArticleCommand.createReadHistory).toHaveBeenCalledWith(userId, articleId, readAt)
    })

    it('データベースエラー時にServerErrorを返すこと', async () => {
      const userId = 100n
      const articleId = 200n
      const readAt = new Date('2024-01-01T10:00:00Z')

      // 記事存在確認のモック
      mockArticleQuery.findArticleById.mockResolvedValue(success(mockArticle))

      const dbError = new ServerError('Database error')
      mockArticleCommand.createReadHistory.mockResolvedValue(failure(dbError))

      const result = await useCase.createReadHistory(userId, articleId, readAt)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBe(dbError)
      }
    })

    it('存在しない記事でNotFoundErrorを返すこと', async () => {
      const userId = 100n
      const articleId = 999n
      const readAt = new Date('2024-01-01T10:00:00Z')

      // 記事が存在しない場合のモック
      mockArticleQuery.findArticleById.mockResolvedValue(success(null))

      const result = await useCase.createReadHistory(userId, articleId, readAt)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toBe('Article with ID 999 not found')
      }

      expect(mockArticleQuery.findArticleById).toHaveBeenCalledWith(articleId)
      expect(mockArticleCommand.createReadHistory).not.toHaveBeenCalled()
    })
  })

  describe('deleteAllReadHistory', () => {
    it('正常にReadHistoryを全削除できること', async () => {
      const userId = 100n
      const articleId = 200n

      mockArticleQuery.findArticleById.mockResolvedValue(success(mockArticle))
      mockArticleCommand.deleteAllReadHistory.mockResolvedValue(success(undefined))

      const result = await useCase.deleteAllReadHistory(userId, articleId)

      expect(isSuccess(result)).toBe(true)
      expect(mockArticleCommand.deleteAllReadHistory).toHaveBeenCalledWith(
        userId,
        mockArticle.articleId,
      )
    })

    it('データベースエラー時にServerErrorを返すこと', async () => {
      const userId = 100n
      const articleId = 200n

      mockArticleQuery.findArticleById.mockResolvedValue(success(mockArticle))
      const dbError = new ServerError('Database error')
      mockArticleCommand.deleteAllReadHistory.mockResolvedValue(failure(dbError))

      const result = await useCase.deleteAllReadHistory(userId, articleId)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBe(dbError)
      }
    })
  })
})
