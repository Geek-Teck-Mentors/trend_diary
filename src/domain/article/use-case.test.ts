import { faker } from '@faker-js/faker'
import { failure, isFailure, isSuccess, success } from '@yuukihayashi0510/core'
import { mockDeep } from 'vitest-mock-extended'
import { NotFoundError, ServerError } from '@/common/errors'
import { OffsetPaginationResult } from '@/common/pagination'
import { Command, Query } from '@/domain/article/repository'
import type { Article, ArticleWithOptionalReadStatus } from '@/domain/article/schema/article-schema'
import { QueryParams } from '@/domain/article/schema/query-schema'
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

const queryMock = mockDeep<Query>()
const commandMock = mockDeep<Command>()

describe('ArticleUseCase', () => {
  const useCase = new UseCase(queryMock, commandMock)
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchArticles', () => {
    describe('正常系', () => {
      it('有効なパラメータで記事検索成功', async () => {
        const params: QueryParams = {
          title: 'test title',
          author: 'test author',
          media: 'qiita',
          from: '2024-01-01',
          to: '2024-01-31',
          readStatus: false,
          limit: 20,
          page: 1,
        }

        queryMock.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params)

        expect(result).toEqual(success(mockPaginationResult))
        expect(queryMock.searchArticles).toHaveBeenCalledTimes(1)
        const calledArgs = queryMock.searchArticles.mock.calls[0][0]
        expect(calledArgs).toEqual(params)
      })

      it('全てのパラメータが含まれるfrom/to検索', async () => {
        const params: QueryParams = {
          title: 'test title',
          author: 'test author',
          media: 'qiita',
          from: '2024-01-01',
          to: '2024-01-31',
          readStatus: false,
          limit: 10,
          page: 2,
        }

        queryMock.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as QueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(queryMock.searchArticles).toHaveBeenCalledTimes(1)
        const calledArgs = queryMock.searchArticles.mock.calls[0][0]
        expect(calledArgs).toEqual(params)
      })

      it('titleパラメータのみで検索', async () => {
        const params: QueryParams = {
          title: 'test title',
          limit: 20,
          page: 1,
        }

        queryMock.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as QueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(queryMock.searchArticles).toHaveBeenCalledWith(
          {
            title: 'test title',
            limit: 20,
            page: 1,
          },
          undefined,
        )
      })

      it('authorパラメータのみで検索', async () => {
        const params: QueryParams = {
          author: 'test author',
          limit: 20,
          page: 1,
        }

        queryMock.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as QueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(queryMock.searchArticles).toHaveBeenCalledWith(
          {
            author: 'test author',
            limit: 20,
            page: 1,
          },
          undefined,
        )
      })

      it('mediaパラメータのみで検索', async () => {
        const params: QueryParams = {
          media: 'zenn',
          limit: 20,
          page: 1,
        }

        queryMock.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as QueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(queryMock.searchArticles).toHaveBeenCalledWith(
          {
            media: 'zenn',
            limit: 20,
            page: 1,
          },
          undefined,
        )
      })

      it('fromパラメータのみで検索', async () => {
        const params: QueryParams = {
          from: '2024-01-01',
          limit: 20,
          page: 1,
        }

        queryMock.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as QueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(queryMock.searchArticles).toHaveBeenCalledWith(
          {
            from: '2024-01-01',
            limit: 20,
            page: 1,
          },
          undefined,
        )
      })

      it('toパラメータのみで検索', async () => {
        const params: QueryParams = {
          to: '2024-01-31',
          limit: 20,
          page: 1,
        }

        queryMock.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as QueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(queryMock.searchArticles).toHaveBeenCalledWith(
          {
            to: '2024-01-31',
            limit: 20,
            page: 1,
          },
          undefined,
        )
      })

      it('from/toパラメータの組み合わせで検索', async () => {
        const params: QueryParams = {
          from: '2024-01-01',
          to: '2024-01-31',
          limit: 20,
          page: 1,
        }

        queryMock.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as QueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(queryMock.searchArticles).toHaveBeenCalledWith(
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
        const params: QueryParams = {
          readStatus: true,
          limit: 20,
          page: 1,
        }

        queryMock.searchArticles.mockResolvedValue(success(mockPaginationResult))

        const result = await useCase.searchArticles(params as QueryParams)

        expect(result).toEqual(success(mockPaginationResult))
        expect(queryMock.searchArticles).toHaveBeenCalledWith(
          {
            readStatus: true,
            limit: 20,
            page: 1,
          },
          undefined,
        )
      })

      it('activeUserIdを渡すと既読情報付きで記事検索成功', async () => {
        const params: QueryParams = {
          limit: 20,
          page: 1,
        }
        const activeUserId = 100n

        queryMock.searchArticles.mockResolvedValue(success(mockPaginationResultWithReadStatus))

        const result = await useCase.searchArticles(params, activeUserId)

        expect(result).toEqual(success(mockPaginationResultWithReadStatus))
        expect(queryMock.searchArticles).toHaveBeenCalledWith(
          {
            limit: 20,
            page: 1,
          },
          activeUserId,
        )
      })
    })

    it('異常系: リポジトリ層でのDBエラー', async () => {
      const params: QueryParams = {
        title: 'test title',
        limit: 20,
        page: 1,
      }

      const dbError = new ServerError('Database error')
      queryMock.searchArticles.mockResolvedValue(failure(dbError))

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
      queryMock.findArticleById.mockResolvedValue(success(mockArticle))

      const mockReadHistory: ReadHistory = {
        readHistoryId: 1n,
        activeUserId: userId,
        articleId: articleId,
        readAt: readAt,
        createdAt: new Date(),
      }
      commandMock.createReadHistory.mockResolvedValue(success(mockReadHistory))

      const result = await useCase.createReadHistory(userId, articleId, readAt)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.activeUserId).toBe(userId)
        expect(result.data.articleId).toBe(articleId)
        expect(result.data.readAt).toBe(readAt)
      }

      expect(queryMock.findArticleById).toHaveBeenCalledWith(articleId)
      expect(commandMock.createReadHistory).toHaveBeenCalledWith(userId, articleId, readAt)
    })

    it('データベースエラー時にServerErrorを返すこと', async () => {
      const userId = 100n
      const articleId = 200n
      const readAt = new Date('2024-01-01T10:00:00Z')

      // 記事存在確認のモック
      queryMock.findArticleById.mockResolvedValue(success(mockArticle))

      const dbError = new ServerError('Database error')
      commandMock.createReadHistory.mockResolvedValue(failure(dbError))

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
      queryMock.findArticleById.mockResolvedValue(success(null))

      const result = await useCase.createReadHistory(userId, articleId, readAt)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(NotFoundError)
        expect(result.error.message).toBe('Article with ID 999 not found')
      }

      expect(queryMock.findArticleById).toHaveBeenCalledWith(articleId)
      expect(commandMock.createReadHistory).not.toHaveBeenCalled()
    })
  })

  describe('deleteAllReadHistory', () => {
    it('正常にReadHistoryを全削除できること', async () => {
      const userId = 100n
      const articleId = 200n

      queryMock.findArticleById.mockResolvedValue(success(mockArticle))
      commandMock.deleteAllReadHistory.mockResolvedValue(success(undefined))

      const result = await useCase.deleteAllReadHistory(userId, articleId)

      expect(isSuccess(result)).toBe(true)
      expect(commandMock.deleteAllReadHistory).toHaveBeenCalledWith(userId, mockArticle.articleId)
    })

    it('データベースエラー時にServerErrorを返すこと', async () => {
      const userId = 100n
      const articleId = 200n

      queryMock.findArticleById.mockResolvedValue(success(mockArticle))
      const dbError = new ServerError('Database error')
      commandMock.deleteAllReadHistory.mockResolvedValue(failure(dbError))

      const result = await useCase.deleteAllReadHistory(userId, articleId)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBe(dbError)
      }
    })
  })
})
