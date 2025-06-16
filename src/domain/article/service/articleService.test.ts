import { faker } from '@faker-js/faker';
import { mockDeep } from 'vitest-mock-extended';
import Article from '@/domain/article/model/article';
import ArticleService from './articleService';
import { ArticleQueryService } from '@/domain/article/repository/articleQueryService';
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema';
import { ServerError } from '@/common/errors';
import { resultError, resultSuccess } from '@/common/types/utility';
import { CursorPaginationResult } from '@/common/pagination';

const mockArticle: Article = new Article(
  BigInt(1),
  'qiita',
  faker.lorem.sentence(),
  faker.person.fullName(),
  faker.lorem.paragraph(),
  faker.internet.url(),
  new Date(),
);

const mockPaginationResult: CursorPaginationResult<Article> = {
  data: [mockArticle],
  nextCursor: undefined,
  prevCursor: undefined,
  hasNext: false,
  hasPrev: false,
};

const mockArticleQueryService = mockDeep<ArticleQueryService>();

describe('ArticleService', () => {
  const service = new ArticleService(mockArticleQueryService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchArticles', () => {
    describe('正常系', () => {
      it('有効なパラメータで記事検索成功', async () => {
        const params: ArticleQueryParams = {
          title: 'test title',
          author: 'test author',
          media: 'qiita',
          from: '2024-01-01',
          to: '2024-01-31',
          read_status: '0',
          limit: 20,
          direction: 'next',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params as ArticleQueryParams);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          ...params,
          limit: 20,
          direction: 'next',
        });
      });

      it('全てのパラメータが含まれるfrom/to検索', async () => {
        const params: ArticleQueryParams = {
          title: 'test title',
          author: 'test author',
          media: 'qiita',
          from: '2024-01-01',
          to: '2024-01-31',
          read_status: '0',
          limit: 10,
          direction: 'prev',
          cursor: 'test-cursor',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params as ArticleQueryParams);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          ...params,
        });
      });

      it('titleパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          title: 'test title',
          limit: 20,
          direction: 'next',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params as ArticleQueryParams);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          title: 'test title',
          limit: 20,
          direction: 'next',
        });
      });

      it('authorパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          author: 'test author',
          limit: 20,
          direction: 'next',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params as ArticleQueryParams);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          author: 'test author',
          limit: 20,
          direction: 'next',
        });
      });

      it('mediaパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          media: 'zenn',
          limit: 20,
          direction: 'next',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params as ArticleQueryParams);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          media: 'zenn',
          limit: 20,
          direction: 'next',
        });
      });

      it('fromパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          from: '2024-01-01',
          limit: 20,
          direction: 'next',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params as ArticleQueryParams);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          from: '2024-01-01',
          limit: 20,
          direction: 'next',
        });
      });

      it('toパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          to: '2024-01-31',
          limit: 20,
          direction: 'next',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params as ArticleQueryParams);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          to: '2024-01-31',
          limit: 20,
          direction: 'next',
        });
      });

      it('from/toパラメータの組み合わせで検索', async () => {
        const params: ArticleQueryParams = {
          from: '2024-01-01',
          to: '2024-01-31',
          limit: 20,
          direction: 'next',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params as ArticleQueryParams);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          from: '2024-01-01',
          to: '2024-01-31',
          limit: 20,
          direction: 'next',
        });
      });

      it('read_statusパラメータのみで検索', async () => {
        const params: ArticleQueryParams = {
          read_status: '1',
          limit: 20,
          direction: 'next',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params as ArticleQueryParams);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          read_status: '1',
          limit: 20,
          direction: 'next',
        });
      });
    });

    it('異常系: リポジトリ層でのDBエラー', async () => {
      const params: ArticleQueryParams = {
        title: 'test title',
        limit: 20,
        direction: 'next',
      };

      const dbError = new ServerError('Database error');
      mockArticleQueryService.searchArticles.mockResolvedValue(resultError(dbError));

      const result = await service.searchArticles(params);

      expect(result).toEqual(resultError(dbError));
    });
  });
});
