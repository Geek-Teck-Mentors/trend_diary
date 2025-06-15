import Article from '@/domain/article/model/article';
import { ArticleQueryService } from '@/domain/article/repository/articleQueryService';
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema';
import { ServerError } from '@/common/errors';
import { AsyncResult } from '@/common/types/utility';
import { CursorPaginationResult } from '@/common/pagination';

export default class ArticleService {
  constructor(private readonly articleQueryService: ArticleQueryService) {}

  async searchArticles(
    params: ArticleQueryParams,
  ): AsyncResult<CursorPaginationResult<Article>, ServerError> {
    // 空文字列を除去
    const optimizedParams: Partial<ArticleQueryParams> = {
      limit: params.limit ?? 20,
      direction: params.direction ?? 'next',
      cursor: params.cursor,
    };

    if (params.title && params.title.trim()) {
      optimizedParams.title = params.title.trim();
    }

    if (params.author && params.author.trim()) {
      optimizedParams.author = params.author.trim();
    }

    if (params.media) {
      optimizedParams.media = params.media;
    }

    if (params.date) {
      optimizedParams.date = params.date;
    }

    if (params.read_status) {
      optimizedParams.read_status = params.read_status;
    }

    return this.articleQueryService.searchArticles(optimizedParams as ArticleQueryParams);
  }
}
