import { Article } from '@prisma/client'
import { AsyncResult } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { OffsetPaginationResult } from '@/common/pagination'
import { Nullable } from '@/common/types/utility'
import { ArticleQueryParams } from './schema/articleQuerySchema'
import type { ArticleWithOptionalReadStatus } from './schema/articleSchema'
import type { ReadHistory } from './schema/readHistorySchema'

export interface ArticleQuery {
  /**
   * 記事を検索する
   * @param params 検索パラメータ
   * @param activeUserId オプション。指定された場合、各記事にisReadフィールドを付与
   */
  searchArticles(
    params: ArticleQueryParams,
    activeUserId?: bigint,
  ): AsyncResult<OffsetPaginationResult<ArticleWithOptionalReadStatus>, ServerError>

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
