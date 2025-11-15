import { Prisma } from '@prisma/client'
import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { NotFoundError, ServerError } from '@/common/errors'
import { OffsetPaginationResult } from '@/common/pagination'
import { Nullable } from '@/common/types/utility'
import fromPrismaToArticle from '@/domain/article/infrastructure/articleMapper'
import { ArticleQuery } from '@/domain/article/repository'
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema'
import type { Article } from '@/domain/article/schema/articleSchema'
import { RdbClient } from '@/infrastructure/rdb'

export default class ArticleQueryImpl implements ArticleQuery {
  constructor(private readonly db: RdbClient) {}

  async searchArticles(
    params: ArticleQueryParams,
  ): AsyncResult<OffsetPaginationResult<Article>, ServerError> {
    const { page = 1, limit = 20, ...searchParams } = params
    const where = ArticleQueryImpl.buildWhereClause(searchParams)
    const orderBy: Prisma.ArticleOrderByWithRelationInput[] = [
      { createdAt: 'desc' },
      { articleId: 'desc' },
    ]

    const result = await wrapAsyncCall(() =>
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
    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    const [total, articles] = result.data
    const mappedArticles = articles.map(fromPrismaToArticle)
    const totalPages = Math.ceil(total / limit)
    const paginationResult: OffsetPaginationResult<Article> = {
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
    if (!article) return failure(new NotFoundError('article not found'))
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
