import { ServerError } from '@/common/errors'
import { CursorPaginationResult } from '@/common/pagination'
import { AsyncResult, Nullable } from '@/common/types/utility'
import Article from '@/domain/article/model/article'
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema'

export interface ArticleQueryService {
  searchArticles(
    params: ArticleQueryParams,
  ): AsyncResult<CursorPaginationResult<Article>, ServerError>
  findArticleById(articleId: bigint): AsyncResult<Nullable<Article>, ServerError>
}
