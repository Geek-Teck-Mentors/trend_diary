import { NotFoundError, ServerError } from '@/common/errors'
import { OffsetPaginationResult } from '@/common/pagination'
import extractTrimmed from '@/common/sanitization'
import { AsyncResult, isError, isNull, resultError, resultSuccess } from '@/common/types/utility'
import { ArticleCommand, ArticleQuery } from '@/domain/article/repository'
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema'
import type { Article } from '@/domain/article/schema/articleSchema'
import type { ReadHistory } from '@/domain/article/schema/readHistorySchema'

export class UseCase {
  constructor(
    private readonly articleQuery: ArticleQuery,
    private readonly articleCommand: ArticleCommand,
  ) {}

  async searchArticles(
    params: ArticleQueryParams,
  ): AsyncResult<OffsetPaginationResult<Article>, ServerError> {
    const optimizedParams: Partial<ArticleQueryParams> = {
      title: extractTrimmed(params.title),
      author: extractTrimmed(params.author),
      limit: params.limit ?? 20,
      page: params.page ?? 1,
      from: params.from,
      to: params.to,
      media: params.media,
      readStatus: params.readStatus,
    }

    return this.articleQuery.searchArticles(optimizedParams as ArticleQueryParams)
  }

  async createReadHistory(
    userId: bigint,
    articleId: bigint,
    readAt: Date,
  ): AsyncResult<ReadHistory, Error> {
    const articleValidation = await this.validateArticleExists(articleId)
    if (isError(articleValidation)) return articleValidation

    return this.articleCommand.createReadHistory(userId, articleId, readAt)
  }

  async deleteAllReadHistory(userId: bigint, articleId: bigint): AsyncResult<void, Error> {
    const articleValidation = await this.validateArticleExists(articleId)
    if (isError(articleValidation)) return articleValidation

    return this.articleCommand.deleteAllReadHistory(userId, articleValidation.data.articleId)
  }

  private async validateArticleExists(articleId: bigint): AsyncResult<Article, Error> {
    const res = await this.articleQuery.findArticleById(articleId)
    if (isError(res)) return res

    if (isNull(res.data)) {
      return resultError(new NotFoundError(`Article with ID ${articleId} not found`))
    }

    return resultSuccess(res.data)
  }
}
