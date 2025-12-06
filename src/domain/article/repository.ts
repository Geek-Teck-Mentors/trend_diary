import { Article } from '@prisma/client'
import { AsyncResult } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { OffsetPaginationResult } from '@/common/pagination'
import { Nullable } from '@/common/types/utility'
import { ArticleQueryParams } from './schema/articleQuerySchema'
import type { ArticleWithReadStatus } from './schema/articleSchema'
import type { ReadHistory } from './schema/readHistorySchema'

export interface ArticleQuery {
  searchArticles(
    params: ArticleQueryParams,
  ): AsyncResult<OffsetPaginationResult<Article>, ServerError>

  searchArticlesWithReadStatus(
    params: ArticleQueryParams,
    activeUserId: bigint,
  ): AsyncResult<OffsetPaginationResult<ArticleWithReadStatus>, ServerError>

  findArticleById(articleId: bigint): AsyncResult<Nullable<Article>, ServerError>
}

export interface ArticleCommand {
  createReadHistory(
    activeUserId: bigint,
    articleId: bigint,
    readAt: Date,
  ): AsyncResult<ReadHistory, Error>

  deleteAllReadHistory(activeUserId: bigint, articleId: bigint): AsyncResult<void, Error>
}
