import Article from '@/domain/article/model/article';
import { ServerError } from '@/common/errors';
import { AsyncResult } from '@/common/types/utility';
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema';
import { CursorPaginationResult } from '@/common/pagination';

export interface ArticleQueryService {
  findById(id: bigint): AsyncResult<Article | null, ServerError>;
  findAll(): AsyncResult<Article[], ServerError>;
  searchArticles(
    params: ArticleQueryParams,
  ): AsyncResult<CursorPaginationResult<Article>, ServerError>;
}
