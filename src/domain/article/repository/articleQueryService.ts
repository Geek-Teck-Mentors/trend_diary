import { ServerError } from '@/common/errors'
import { CursorPaginationResult } from '@/common/pagination'
import { AsyncResult, Nullable } from '@/common/types/utility'
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema'
import type { Article } from '@/domain/article/schema/articleSchema'

export interface ArticleQueryService {
  searchArticles(
    params: ArticleQueryParams,
  ): AsyncResult<CursorPaginationResult<Article>, ServerError>
  findArticleById(articleId: bigint): AsyncResult<Nullable<Article>, ServerError>
}
