import { faker } from '@faker-js/faker';
import { mockDeep } from 'vitest-mock-extended';
import Article from '@/domain/article/model/article';
import ArticleService from './articleService';
import { ArticleQueryService } from '@/domain/article/repository/articleQueryService';
import { ArticleCommandService } from '@/domain/article/repository/articleCommandService';
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema';
import { ServerError } from '@/common/errors';
import { resultError, resultSuccess, isSuccess, isError } from '@/common/types/utility';
import { CursorPaginationResult } from '@/common/pagination';
import ReadHistory from '@/domain/article/model/readHistory';

const mockArticle: Article = new Article(
  BigInt(1),
  'qiita',
  faker.lorem.sentence(),
  faker.person.fullName(),
  faker.lorem.paragraph(),
  faker.internet.url(),
  new Date(),
)

const mockPaginationResult: CursorPaginationResult<Article> = {
  data: [mockArticle],
  nextCursor: undefined,
  prevCursor: undefined,
  hasNext: false,
  hasPrev: false,
}

const mockArticleQueryService = mockDeep<ArticleQueryService>()
const mockArticleCommandService = mockDeep<ArticleCommandService>();

describe('ArticleService', () => {
  const service = new ArticleService(mockArticleQueryService, mockArticleCommandService)

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
          direction: 'next',
          cursor: undefined,
        }

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        )

        const result = await service.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(resultSuccess(mockPaginationResult))
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledTimes(1)
        const calledArgs = mockArticleQueryService.searchArticles.mock.calls[0][0]
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
          direction: 'prev',
          cursor: 'test-cursor',
        }

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        )

        const result = await service.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(resultSuccess(mockPaginationResult))
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledTimes(1)
        const calledArgs = mockArticleQueryService.searchArticles.mock.calls[0][0]
        expect(calledArgs).toEqual(params)
      })

      it('titleパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          title: 'test title',
          limit: 20,
          direction: 'next',
        }

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        )

        const result = await service.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(resultSuccess(mockPaginationResult))
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          title: 'test title',
          limit: 20,
          direction: 'next',
        })
      })

      it('authorパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          author: 'test author',
          limit: 20,
          direction: 'next',
        }

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        )

        const result = await service.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(resultSuccess(mockPaginationResult))
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          author: 'test author',
          limit: 20,
          direction: 'next',
        })
      })

      it('mediaパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          media: 'zenn',
          limit: 20,
          direction: 'next',
        }

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        )

        const result = await service.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(resultSuccess(mockPaginationResult))
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          media: 'zenn',
          limit: 20,
          direction: 'next',
        })
      })

      it('fromパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          from: '2024-01-01',
          limit: 20,
          direction: 'next',
        }

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        )

        const result = await service.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(resultSuccess(mockPaginationResult))
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          from: '2024-01-01',
          limit: 20,
          direction: 'next',
        })
      })

      it('toパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          to: '2024-01-31',
          limit: 20,
          direction: 'next',
        }

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        )

        const result = await service.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(resultSuccess(mockPaginationResult))
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          to: '2024-01-31',
          limit: 20,
          direction: 'next',
        })
      })

      it('from/toパラメータの組み合わせで検索', async () => {
        const params: ArticleQueryParams = {
          from: '2024-01-01',
          to: '2024-01-31',
          limit: 20,
          direction: 'next',
        }

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        )

        const result = await service.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(resultSuccess(mockPaginationResult))
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          from: '2024-01-01',
          to: '2024-01-31',
          limit: 20,
          direction: 'next',
        })
      })

      it('readStatusパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          readStatus: true,
          limit: 20,
          direction: 'next',
        }

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        )

        const result = await service.searchArticles(params as ArticleQueryParams)

        expect(result).toEqual(resultSuccess(mockPaginationResult))
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          readStatus: true,
          limit: 20,
          direction: 'next',
        })
      })
    })

    it('異常系: リポジトリ層でのDBエラー', async () => {
      const params: ArticleQueryParams = {
        title: 'test title',
        limit: 20,
        direction: 'next',
      }

      const dbError = new ServerError('Database error')
      mockArticleQueryService.searchArticles.mockResolvedValue(resultError(dbError))

      const result = await service.searchArticles(params)

      expect(result).toEqual(resultError(dbError))
    })
  })

  describe('createReadHistory', () => {
    it('正常にReadHistoryを作成できること', async () => {
      const userId = 100n;
      const articleId = 200n;
      const readAt = new Date('2024-01-01T10:00:00Z');

      const mockReadHistory = new ReadHistory(1n, userId, articleId, readAt, new Date());
      mockArticleCommandService.createReadHistory.mockResolvedValue(resultSuccess(mockReadHistory));

      const result = await service.createReadHistory(userId, articleId, readAt);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.userId).toBe(userId);
        expect(result.data.articleId).toBe(articleId);
        expect(result.data.readAt).toBe(readAt);
      }

      expect(mockArticleCommandService.createReadHistory).toHaveBeenCalledWith(
        userId,
        articleId,
        readAt,
      );
    });

    it('データベースエラー時にServerErrorを返すこと', async () => {
      const userId = 100n;
      const articleId = 200n;
      const readAt = new Date('2024-01-01T10:00:00Z');

      const dbError = new ServerError('Database error');
      mockArticleCommandService.createReadHistory.mockResolvedValue(resultError(dbError));

      const result = await service.createReadHistory(userId, articleId, readAt);

      expect(isError(result)).toBe(true);
      if (isError(result)) {
        expect(result.error).toBe(dbError);
      }
    });
  });

  describe('deleteAllReadHistory', () => {
    it('正常にReadHistoryを全削除できること', async () => {
      const userId = 100n;
      const articleId = 200n;

      mockArticleCommandService.deleteAllReadHistory.mockResolvedValue(resultSuccess(undefined));

      const result = await service.deleteAllReadHistory(userId, articleId);

      expect(isSuccess(result)).toBe(true);
      expect(mockArticleCommandService.deleteAllReadHistory).toHaveBeenCalledWith(
        userId,
        articleId,
      );
    });

    it('データベースエラー時にServerErrorを返すこと', async () => {
      const userId = 100n;
      const articleId = 200n;

      const dbError = new ServerError('Database error');
      mockArticleCommandService.deleteAllReadHistory.mockResolvedValue(resultError(dbError));

      const result = await service.deleteAllReadHistory(userId, articleId);

      expect(isError(result)).toBe(true);
      if (isError(result)) {
        expect(result.error).toBe(dbError);
      }
    });
  });
})
