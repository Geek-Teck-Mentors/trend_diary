import { Prisma } from '@prisma/client'
import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { DEFAULT_LIMIT, DEFAULT_PAGE, OffsetPaginationResult } from '@/common/pagination'
import { Nullable } from '@/common/types/utility'
import fromPrismaToArticle from '@/domain/article/infrastructure/mapper'
import { Query } from '@/domain/article/repository'
import type { Article, ArticleWithOptionalReadStatus } from '@/domain/article/schema/article-schema'
import { QueryParams } from '@/domain/article/schema/query-schema'
import { RdbClient } from '@/infrastructure/rdb'
import { fromDbId, toDbId } from '@/infrastructure/rdb-id'

export default class QueryImpl implements Query {
  constructor(private readonly db: RdbClient) {}

  async searchArticles(
    params: QueryParams,
    activeUserId?: bigint,
  ): AsyncResult<OffsetPaginationResult<ArticleWithOptionalReadStatus>, ServerError> {
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, ...searchParams } = params
    const where = QueryImpl.buildWhereClause(searchParams)
    const orderBy: Prisma.ArticleOrderByWithRelationInput[] = [
      { createdAt: 'desc' },
      { articleId: 'desc' },
    ]

    const totalResult = await wrapAsyncCall(() => this.db.article.count({ where }))
    if (isFailure(totalResult)) {
      return failure(new ServerError(totalResult.error))
    }

    const articlesResult = await wrapAsyncCall(() =>
      this.db.article.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    )

    if (isFailure(articlesResult)) {
      return failure(new ServerError(articlesResult.error))
    }

    const total = totalResult.data
    const articles = articlesResult.data
    const mappedArticles: ArticleWithOptionalReadStatus[] = articles.map(fromPrismaToArticle)

    if (activeUserId !== undefined && mappedArticles.length > 0) {
      const dbActiveUserId = toDbId(activeUserId)
      const readHistoriesResult = await wrapAsyncCall(() =>
        this.db.readHistory.findMany({
          where: {
            activeUserId: dbActiveUserId,
            articleId: {
              in: mappedArticles.map((article) => toDbId(article.articleId)),
            },
          },
          select: {
            articleId: true,
          },
        }),
      )

      if (isFailure(readHistoriesResult)) {
        return failure(new ServerError(readHistoriesResult.error))
      }

      const readArticleIdSet = new Set(
        readHistoriesResult.data.map((history) => fromDbId(history.articleId)),
      )
      mappedArticles.forEach((article) => {
        article.isRead = readArticleIdSet.has(article.articleId)
      })
    } else {
      mappedArticles.forEach((article) => {
        article.isRead = undefined
      })
    }

    const totalPages = Math.ceil(total / limit)
    return success({
      data: mappedArticles,
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    })
  }

  async findArticleById(articleId: bigint): AsyncResult<Nullable<Article>, ServerError> {
    const dbArticleId = toDbId(articleId)
    const result = await wrapAsyncCall(() =>
      this.db.article.findUnique({
        where: { articleId: dbArticleId },
      }),
    )
    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    const article = result.data
    if (!article) return success(null)
    return success(fromPrismaToArticle(article))
  }

  private static buildWhereClause(params: Omit<QueryParams, 'page' | 'limit'>) {
    const where: Prisma.ArticleWhereInput = {}

    if (params.title) {
      where.title = {
        contains: params.title,
      }
    }

    if (params.author) {
      where.author = {
        contains: params.author,
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
