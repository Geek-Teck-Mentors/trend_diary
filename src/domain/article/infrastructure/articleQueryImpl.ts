import { Prisma } from '@prisma/client'
import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { OffsetPaginationResult } from '@/common/pagination'
import { Nullable } from '@/common/types/utility'
import fromPrismaToArticle from '@/domain/article/infrastructure/articleMapper'
import { ArticleQuery } from '@/domain/article/repository'
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema'
import type { Article, ArticleWithOptionalReadStatus } from '@/domain/article/schema/articleSchema'
import { RdbClient } from '@/infrastructure/rdb'

export default class ArticleQueryImpl implements ArticleQuery {
  constructor(private readonly db: RdbClient) {}

  async searchArticles(
    params: ArticleQueryParams,
    activeUserId?: bigint,
  ): AsyncResult<OffsetPaginationResult<ArticleWithOptionalReadStatus>, ServerError> {
    const { page = 1, limit = 20, ...searchParams } = params
    const where = ArticleQueryImpl.buildWhereClause(searchParams)
    const orderBy: Prisma.ArticleOrderByWithRelationInput[] = [
      { createdAt: 'desc' },
      { articleId: 'desc' },
    ]

    // 記事取得
    const articlesResult = await wrapAsyncCall(() =>
      this.db.$transaction([
        this.db.article.count({ where }),
        this.db.article.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]),
    )
    if (isFailure(articlesResult)) {
      return failure(new ServerError(articlesResult.error))
    }

    const [total, articles] = articlesResult.data

    // activeUserIdがある場合は既読情報を取得
    let readArticleIds: Set<bigint> | null = null
    if (activeUserId !== undefined) {
      const articleIds = articles.map((a) => a.articleId)
      const readHistoriesResult = await wrapAsyncCall(() =>
        this.db.readHistory.findMany({
          where: {
            activeUserId,
            articleId: { in: articleIds },
          },
        }),
      )
      if (isFailure(readHistoriesResult)) {
        return failure(new ServerError(readHistoriesResult.error))
      }
      readArticleIds = new Set(readHistoriesResult.data.map((rh) => rh.articleId))
    }

    // 記事をマッピング（activeUserIdがある場合はisReadを付与）
    const mappedArticles: ArticleWithOptionalReadStatus[] = articles.map((article) => ({
      ...fromPrismaToArticle(article),
      isRead: readArticleIds?.has(article.articleId),
    }))

    const totalPages = Math.ceil(total / limit)
    const paginationResult: OffsetPaginationResult<ArticleWithOptionalReadStatus> = {
      data: mappedArticles,
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }

    return success(paginationResult)
  }

  async findArticleById(articleId: bigint): AsyncResult<Nullable<Article>, ServerError> {
    const result = await wrapAsyncCall(() =>
      this.db.article.findUnique({
        where: { articleId },
      }),
    )
    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    const article = result.data
    if (!article) return success(null)
    return success(fromPrismaToArticle(article))
  }

  private static buildWhereClause(
    params: Omit<ArticleQueryParams, 'page' | 'limit'>,
  ): Prisma.ArticleWhereInput {
    const where: Prisma.ArticleWhereInput = {}

    if (params.title) {
      where.title = {
        contains: params.title,
        mode: 'insensitive',
      }
    }

    if (params.author) {
      where.author = {
        contains: params.author,
        mode: 'insensitive',
      }
    }

    if (params.media) {
      where.media = params.media
    }

    if (params.from || params.to) {
      const dateRange: { gte?: Date; lt?: Date } = {}

      if (params.from) {
        // INFO: 日付をJSTのoffsetをつけて変換
        dateRange.gte = new Date(`${params.from}T00:00:00+09:00`)
      }

      if (params.to) {
        const toDate = new Date(`${params.to}T00:00:00+09:00`)
        toDate.setDate(toDate.getDate() + 1)
        dateRange.lt = toDate
      }

      where.createdAt = dateRange
    }

    return where
  }
}
