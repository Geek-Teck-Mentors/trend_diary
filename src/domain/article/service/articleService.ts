import Article from '@/domain/article/model/article';
import { ArticleQueryService } from '@/domain/article/repository/articleQueryService';
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema';
import { ServerError } from '@/common/errors';
import { AsyncResult } from '@/common/types/utility';
import { CursorPaginationResult } from '@/common/pagination';
import extractTrimmed from '@/common/sanitize';

export default class ArticleService {
  constructor(private readonly articleQueryService: ArticleQueryService) {}

  async searchArticles(
    params: ArticleQueryParams,
  ): AsyncResult<CursorPaginationResult<Article>, ServerError> {
    const optimizedParams: Partial<ArticleQueryParams> = {
      limit: params.limit ?? 20,
      direction: params.direction ?? 'next',
      cursor: params.cursor,
    };

    const trimmedTitle = extractTrimmed(params.title);
    if (trimmedTitle) {
      optimizedParams.title = trimmedTitle;
    }

    const trimmedAuthor = extractTrimmed(params.author);
    if (trimmedAuthor) {
      optimizedParams.author = trimmedAuthor;
    }

    if (params.date) {
      optimizedParams.date = params.date;
    }

    if (params.from) {
      optimizedParams.from = params.from;
    }

    if (params.to) {
      optimizedParams.to = params.to;
    }

    if (params.media) {
      optimizedParams.media = params.media;
    }

    if (params.read_status) {
      optimizedParams.read_status = params.read_status;
    }

    return this.articleQueryService.searchArticles(optimizedParams as ArticleQueryParams);
  }
}
