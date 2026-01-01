import { Article } from '@prisma/client'
import { AsyncResult } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { OffsetPaginationResult } from '@/common/pagination'
import { Nullable } from '@/common/types/utility'
import type { ArticleWithOptionalReadStatus } from './schema/article-schema'
import { QueryParams } from './schema/query-schema'
import type { ReadHistory } from './schema/read-history-schema'

export interface Query {
  /**
   * 記事を検索する
   * @param params 検索パラメータ
   * @param activeUserId オプション。指定された場合、各記事にisReadフィールドを付与
   */
  searchArticles(
    params: QueryParams,
    activeUserId?: bigint,
  ): AsyncResult<OffsetPaginationResult<ArticleWithOptionalReadStatus>, ServerError>

  findArticleById(articleId: bigint): AsyncResult<Nullable<Article>, ServerError>
}

export interface Command {
  createReadHistory(
    activeUserId: bigint,
    articleId: bigint,
    readAt: Date,
  ): AsyncResult<ReadHistory, Error>

  deleteAllReadHistory(activeUserId: bigint, articleId: bigint): AsyncResult<void, Error>
}
