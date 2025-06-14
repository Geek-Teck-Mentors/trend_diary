import { faker } from '@faker-js/faker';
import { mockDeep } from 'vitest-mock-extended';
import Article from '@/domain/article/model/article';
import ArticleService from './articleService';
import { ArticleQueryService } from '@/domain/article/repository/articleQueryService';
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema';
import { ServerError, ClientError } from '@/common/errors';
import { resultError, resultSuccess, isError } from '@/common/types/utility';

const mockArticle: Article = new Article(
  BigInt(1),
  'qiita',
  faker.lorem.sentence(),
  faker.person.fullName(),
  faker.lorem.paragraph(),
  faker.internet.url(),
  new Date(),
);

const mockArticleQueryService = mockDeep<ArticleQueryService>();

describe('ArticleService', () => {
  const service = new ArticleService(mockArticleQueryService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchArticles', () => {
    it('正常系: 有効なパラメータで記事検索成功', async () => {
      const params: ArticleQueryParams = {
        title: 'test title',
        author: 'test author',
        media: 'qiita',
        date: '2024-01-01',
        read_status: '0',
      };

      mockArticleQueryService.searchArticles.mockResolvedValue(resultSuccess([mockArticle]));

      const result = await service.searchArticles(params);

      expect(result).toEqual(resultSuccess([mockArticle]));
      expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith(params);
    });

    it('正常系: titleパラメータのみで検索', async () => {
      const params: ArticleQueryParams = {
        title: 'test title',
      };

      mockArticleQueryService.searchArticles.mockResolvedValue(resultSuccess([mockArticle]));

      const result = await service.searchArticles(params);

      expect(result).toEqual(resultSuccess([mockArticle]));
      expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith(params);
    });

    it('正常系: authorパラメータのみで検索', async () => {
      const params: ArticleQueryParams = {
        author: 'test author',
      };

      mockArticleQueryService.searchArticles.mockResolvedValue(resultSuccess([mockArticle]));

      const result = await service.searchArticles(params);

      expect(result).toEqual(resultSuccess([mockArticle]));
      expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith(params);
    });

    it('正常系: mediaパラメータのみで検索', async () => {
      const params: ArticleQueryParams = {
        media: 'zenn',
      };

      mockArticleQueryService.searchArticles.mockResolvedValue(resultSuccess([mockArticle]));

      const result = await service.searchArticles(params);

      expect(result).toEqual(resultSuccess([mockArticle]));
      expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith(params);
    });

    it('正常系: 空文字列パラメータの最適化処理', async () => {
      const params: ArticleQueryParams = {
        title: '  test title  ',
        author: '  test author  ',
        media: 'qiita',
      };

      const optimizedParams: ArticleQueryParams = {
        title: 'test title',
        author: 'test author',
        media: 'qiita',
      };

      mockArticleQueryService.searchArticles.mockResolvedValue(resultSuccess([mockArticle]));

      const result = await service.searchArticles(params);

      expect(result).toEqual(resultSuccess([mockArticle]));
      expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith(optimizedParams);
    });

    it('正常系: 空文字列や空白のみのパラメータは除去される', async () => {
      const params: ArticleQueryParams = {
        title: '',
        author: '   ',
        media: 'qiita',
      };

      const optimizedParams: ArticleQueryParams = {
        media: 'qiita',
      };

      mockArticleQueryService.searchArticles.mockResolvedValue(resultSuccess([mockArticle]));

      const result = await service.searchArticles(params);

      expect(result).toEqual(resultSuccess([mockArticle]));
      expect(mockArticleQueryService.searchArticles).toHaveBeenCalledWith(optimizedParams);
    });

    describe('準正常系', () => {
      it('無効なdate形式', async () => {
        const params = {
          date: 'invalid-date',
        };

        const result = await service.searchArticles(params);

        expect(isError(result)).toBe(true);
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(ClientError);
          expect(result.error.message).toContain('Invalid search parameters');
        }
      });
    });

    it('異常系: リポジトリ層でのDBエラー', async () => {
      const params: ArticleQueryParams = {
        title: 'test title',
      };

      const dbError = new ServerError('Database error');
      mockArticleQueryService.searchArticles.mockResolvedValue(resultError(dbError));

      const result = await service.searchArticles(params);

      expect(result).toEqual(resultError(dbError));
    });
  });
});
