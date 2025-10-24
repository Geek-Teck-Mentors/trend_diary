import { Article } from '@prisma/client'
import { ServerError } from '@/common/errors'
import { OffsetPaginationResult } from '@/common/pagination'
import { AsyncResult, Nullable } from '@/common/types/utility'
import { ArticleQueryParams } from './schema/articleQuerySchema'
import type { ReadHistory } from './schema/readHistorySchema'

export interface ArticleQuery {
  searchArticles(
    params: ArticleQueryParams,
  ): AsyncResult<OffsetPaginationResult<Article>, ServerError>
  findArticleById(articleId: bigint): AsyncResult<Nullable<Article>, ServerError>
}

export interface ArticleCommand {
  createReadHistory(
    userId: bigint,
    articleId: bigint,
    readAt: Date,
  ): AsyncResult<ReadHistory, Error>

  deleteAllReadHistory(userId: bigint, articleId: bigint): AsyncResult<void, Error>
}
