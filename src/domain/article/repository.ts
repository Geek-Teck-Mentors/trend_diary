import { Article } from '@prisma/client'
import { ServerError } from '@/common/errors'
import { CursorPaginationResult } from '@/common/pagination'
import { AsyncResult, Nullable } from '@/common/types/utility'
import { ArticleQueryParams } from './schema/articleQuerySchema'
import type { ReadHistory } from './schema/readHistorySchema'

export interface ArticleQueryService {
  searchArticles(
    params: ArticleQueryParams,
  ): AsyncResult<CursorPaginationResult<Article>, ServerError>
  findArticleById(articleId: bigint): AsyncResult<Nullable<Article>, ServerError>
}

export interface ArticleCommandService {
  createReadHistory(
    activeUserId: bigint,
    articleId: bigint,
    readAt: Date,
  ): AsyncResult<ReadHistory, Error>

  deleteAllReadHistory(activeUserId: bigint, articleId: bigint): AsyncResult<void, Error>
}
