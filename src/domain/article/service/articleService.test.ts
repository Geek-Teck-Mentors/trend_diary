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

  describe('findById', () => {
    it('IDで記事を取得', async () => {
      const articleId = BigInt(1);
      mockArticleQueryService.findById.mockResolvedValue(resultSuccess(mockArticle));

      const result = await service.findById(articleId);

      expect(result).toEqual(resultSuccess(mockArticle));
      expect(mockArticleQueryService.findById).toHaveBeenCalledWith(articleId);
    });

    it('存在しないIDの場合はnullを返す', async () => {
      const articleId = BigInt(999);
      mockArticleQueryService.findById.mockResolvedValue(resultSuccess(null));

      const result = await service.findById(articleId);

      expect(result).toEqual(resultSuccess(null));
      expect(mockArticleQueryService.findById).toHaveBeenCalledWith(articleId);
    });

    it('DBエラーの場合', async () => {
      const articleId = BigInt(1);
      const dbError = new ServerError('Database error');
      mockArticleQueryService.findById.mockResolvedValue(resultError(dbError));

      const result = await service.findById(articleId);

      expect(result).toEqual(resultError(dbError));
    });
  });

  describe('findAll', () => {
    it('全記事を取得', async () => {
      const articles = [mockArticle];
      mockArticleQueryService.findAll.mockResolvedValue(resultSuccess(articles));

      const result = await service.findAll();

      expect(result).toEqual(resultSuccess(articles));
      expect(mockArticleQueryService.findAll).toHaveBeenCalled();
    });

    it('記事が存在しない場合は空配列を返す', async () => {
      mockArticleQueryService.findAll.mockResolvedValue(resultSuccess([]));

      const result = await service.findAll();

      expect(result).toEqual(resultSuccess([]));
      expect(mockArticleQueryService.findAll).toHaveBeenCalled();
    });

    it('DBエラーの場合', async () => {
      const dbError = new ServerError('Database error');
      mockArticleQueryService.findAll.mockResolvedValue(resultError(dbError));

      const result = await service.findAll();

      expect(result).toEqual(resultError(dbError));
    });
  });

  describe('searchArticles', () => {
    describe('正常系', () => {
      it('有効なパラメータで記事検索成功', async () => {
        const params: Partial<ArticleQueryParams> = {
          title: 'test title',
          author: 'test author',
          media: 'qiita',
          date: '2024-01-01',
          read_status: '0',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          ...params,
          limit: 20,
          direction: 'next',
        });
      });

      it('titleパラメータのみで検索', async () => {
        const params: Partial<ArticleQueryParams> = {
          title: 'test title',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          title: 'test title',
          limit: 20,
          direction: 'next',
        });
      });

      it('authorパラメータのみで検索', async () => {
        const params: Partial<ArticleQueryParams> = {
          author: 'test author',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          author: 'test author',
          limit: 20,
          direction: 'next',
        });
      });

      it('mediaパラメータのみで検索', async () => {
        const params: Partial<ArticleQueryParams> = {
          media: 'zenn',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          media: 'zenn',
          limit: 20,
          direction: 'next',
        });
      });

      it('空文字列パラメータの最適化処理', async () => {
        const params: Partial<ArticleQueryParams> = {
          title: '  test title  ',
          author: '  test author  ',
          media: 'qiita',
        };

        const optimizedParams: ArticleQueryParams = {
          title: 'test title',
          author: 'test author',
          media: 'qiita',
          limit: 20,
          direction: 'next',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith(optimizedParams);
      });

      it('空文字列や空白のみのパラメータは除去される', async () => {
        const params: Partial<ArticleQueryParams> = {
          title: '',
          author: '   ',
          media: 'qiita',
        };

        const optimizedParams: ArticleQueryParams = {
          media: 'qiita',
          limit: 20,
          direction: 'next',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith(optimizedParams);
      });

      it('cursor paginationパラメータ', async () => {
        const params: Partial<ArticleQueryParams> = {
          title: 'test',
          cursor: 'test-cursor',
          limit: 10,
          direction: 'prev',
        };

        mockArticleQueryService.searchArticles.mockResolvedValue(
          resultSuccess(mockPaginationResult),
        );

        const result = await service.searchArticles(params);

        expect(result).toEqual(resultSuccess(mockPaginationResult));
        expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith({
          title: 'test',
          cursor: 'test-cursor',
          limit: 10,
          direction: 'prev',
        });
      });
    });

    it('異常系: リポジトリ層でのDBエラー', async () => {
      const params: Partial<ArticleQueryParams> = {
        title: 'test title',
      };

      const dbError = new ServerError('Database error');
      mockArticleQueryService.searchArticles.mockResolvedValue(resultError(dbError));

      const result = await service.searchArticles(params);

      expect(result).toEqual(resultError(dbError));
    });
  });
});
