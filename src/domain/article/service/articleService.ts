import Article from '@/domain/article/article';
import { ArticleQueryService } from '@/domain/article/repository/articleQueryService';
import { ArticleQueryParams, articleQuerySchema } from '@/domain/article/schema/articleQuerySchema';
import { ServerError, ClientError } from '@/common/errors';
import { AsyncResult, resultError } from '@/common/types/utility';

export default class ArticleService {
  constructor(private readonly articleQueryService: ArticleQueryService) {}

  async searchArticles(
    params: ArticleQueryParams,
  ): AsyncResult<Article[], ServerError | ClientError> {
    // ビジネスロジック: パラメータのバリデーション
    const validationResult = articleQuerySchema.safeParse(params);
    if (!validationResult.success) {
      return resultError(
        new ClientError(`Invalid search parameters: ${validationResult.error.message}`),
      );
    }

    // ビジネスロジック: 検索条件の最適化
    const optimizedParams = ArticleService.optimizeSearchParams(validationResult.data);

    return this.articleQueryService.searchArticles(optimizedParams);
  }

  private static optimizeSearchParams(params: ArticleQueryParams): ArticleQueryParams {
    // 空文字列を除去
    const optimized: ArticleQueryParams = {};

    if (params.title && params.title.trim()) {
      optimized.title = params.title.trim();
    }

    if (params.author && params.author.trim()) {
      optimized.author = params.author.trim();
    }

    if (params.media) {
      optimized.media = params.media;
    }

    if (params.date) {
      optimized.date = params.date;
    }

    if (params.read_status) {
      optimized.read_status = params.read_status;
    }

    return optimized;
  }
}
