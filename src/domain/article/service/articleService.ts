import { ServerError } from '@/common/errors'
import { CursorPaginationResult } from '@/common/pagination'
import extractTrimmed from '@/common/sanitization'
import { AsyncResult } from '@/common/types/utility'
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
    return this.articleCommandService.createReadHistory(userId, articleId, readAt)
  }

  async deleteAllReadHistory(userId: bigint, articleId: bigint): AsyncResult<void, Error> {
    return this.articleCommandService.deleteAllReadHistory(userId, articleId)
  }
}
