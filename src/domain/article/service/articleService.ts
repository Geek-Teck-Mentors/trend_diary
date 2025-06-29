import { NotFoundError, ServerError } from '@/common/errors'
import { CursorPaginationResult } from '@/common/pagination'
import extractTrimmed from '@/common/sanitization'
import { AsyncResult, isError, isNull, resultError, resultSuccess } from '@/common/types/utility'
import Article from '@/domain/article/model/article'
import ReadHistory from '@/domain/article/model/readHistory'
import { ArticleCommandService } from '@/domain/article/repository/articleCommandService'
import { ArticleQueryService } from '@/domain/article/repository/articleQueryService'
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema'

export default class ArticleService {
  constructor(
    private readonly articleQueryService: ArticleQueryService,
    private readonly articleCommandService: ArticleCommandService,
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

    return this.articleQueryService.searchArticles(optimizedParams as ArticleQueryParams)
  }

  async createReadHistory(
    userId: bigint,
    articleId: bigint,
    readAt: Date,
  ): AsyncResult<ReadHistory, Error> {
    const articleValidation = await this.validateArticleExists(articleId)
    if (isError(articleValidation)) return articleValidation

    return this.articleCommandService.createReadHistory(userId, articleId, readAt)
  }

  async deleteAllReadHistory(userId: bigint, articleId: bigint): AsyncResult<void, Error> {
    const articleValidation = await this.validateArticleExists(articleId)
    if (isError(articleValidation)) return articleValidation

    return this.articleCommandService.deleteAllReadHistory(userId, articleValidation.data.articleId)
  }

  private async validateArticleExists(articleId: bigint): AsyncResult<Article, Error> {
    const res = await this.articleQueryService.findArticleById(articleId)
    if (isError(res)) return res

    if (isNull(res.data)) {
      return resultError(new NotFoundError(`Article with ID ${articleId} not found`))
    }

    return resultSuccess(res.data)
  }
}
