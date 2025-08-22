import { NotFoundError, ServerError } from '@/common/errors'
import { CursorPaginationResult } from '@/common/pagination'
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
  ): AsyncResult<CursorPaginationResult<Article>, ServerError> {
    const optimizedParams: Partial<ArticleQueryParams> = {
      title: extractTrimmed(params.title),
      author: extractTrimmed(params.author),
      limit: params.limit ?? 20,
      direction: params.direction ?? 'next',
      cursor: params.cursor,
      from: params.from,
      to: params.to,
      media: params.media,
      readStatus: params.readStatus,
    }

    return this.articleQuery.searchArticles(optimizedParams as ArticleQueryParams)
  }

  async createReadHistory(
    activeUserId: bigint,
    articleId: bigint,
    readAt: Date,
  ): AsyncResult<ReadHistory, Error> {
    const articleValidation = await this.validateArticleExists(articleId)
    if (isError(articleValidation)) return articleValidation

    return this.articleCommand.createReadHistory(activeUserId, articleId, readAt)
  }

  async deleteAllReadHistory(activeUserId: bigint, articleId: bigint): AsyncResult<void, Error> {
    const articleValidation = await this.validateArticleExists(articleId)
    if (isError(articleValidation)) return articleValidation

    return this.articleCommand.deleteAllReadHistory(activeUserId, articleValidation.data.articleId)
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
