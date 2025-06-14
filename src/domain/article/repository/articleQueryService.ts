import Article from '@/domain/article/article';
import { ServerError } from '@/common/errors';
import { AsyncResult } from '@/common/types/utility';
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema';

export interface ArticleQueryService {
  searchArticles(params: ArticleQueryParams): AsyncResult<Article[], ServerError>;
}