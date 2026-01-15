import { AsyncResult, failure, isFailure, success } from '@yuukihayashi0510/core'
import { NotFoundError, ServerError } from '@/common/errors'
import { DEFAULT_LIMIT, DEFAULT_PAGE, OffsetPaginationResult } from '@/common/pagination'
import extractTrimmed from '@/common/sanitization'
import { isNull } from '@/common/types/utility'
import { Command, Query } from '@/domain/article/repository'
import type { Article, ArticleWithOptionalReadStatus } from '@/domain/article/schema/article-schema'
import { QueryParams } from '@/domain/article/schema/query-schema'
import type { ReadHistory } from '@/domain/article/schema/read-history-schema'

export class UseCase {
  constructor(
    private readonly query: Query,
    private readonly command: Command,
  ) {}

  /**
   * 記事を検索する
   * @param params 検索パラメータ
   * @param activeUserId オプション。指定された場合、各記事にisReadフィールドを付与
   */
  async searchArticles(
    params: QueryParams,
    activeUserId?: bigint,
  ): AsyncResult<OffsetPaginationResult<ArticleWithOptionalReadStatus>, ServerError> {
    const optimizedParams: QueryParams = {
      title: extractTrimmed(params.title),
      author: extractTrimmed(params.author),
      limit: params.limit ?? DEFAULT_LIMIT,
      page: params.page ?? DEFAULT_PAGE,
      from: params.from,
      to: params.to,
      media: params.media,
      readStatus: params.readStatus,
    }

    return this.query.searchArticles(optimizedParams, activeUserId)
  }

  async createReadHistory(
    activeUserId: bigint,
    articleId: bigint,
    readAt: Date,
  ): AsyncResult<ReadHistory, Error> {
    const articleValidation = await this.validateArticleExists(articleId)
    if (isFailure(articleValidation)) return articleValidation

    return this.command.createReadHistory(activeUserId, articleId, readAt)
  }

  async deleteAllReadHistory(activeUserId: bigint, articleId: bigint): AsyncResult<void, Error> {
    const articleValidation = await this.validateArticleExists(articleId)
    if (isFailure(articleValidation)) return articleValidation

    return this.command.deleteAllReadHistory(activeUserId, articleValidation.data.articleId)
  }

  private async validateArticleExists(articleId: bigint): AsyncResult<Article, Error> {
    const res = await this.query.findArticleById(articleId)
    if (isFailure(res)) return res

    if (isNull(res.data)) {
      return failure(new NotFoundError(`Article with ID ${articleId} not found`))
    }

    return success(res.data)
  }
}
