import Article from '@/domain/article/article';
import { ArticleQueryService } from '@/domain/article/repository/articleQueryService';
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema';
import { ServerError } from '@/common/errors';
import { AsyncResult } from '@/common/types/utility';

export default class ArticleService {
  constructor(private readonly articleQueryService: ArticleQueryService) {}

  async searchArticles(params: ArticleQueryParams): AsyncResult<Article[], ServerError> {
    return this.articleQueryService.searchArticles(params);
  }
}