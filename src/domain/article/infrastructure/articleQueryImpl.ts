import { Prisma } from '@prisma/client'
import { ServerError } from '@/common/errors'
import { OffsetPaginationResult } from '@/common/pagination'
import { AsyncResult, Nullable, resultError, resultSuccess } from '@/common/types/utility'
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
    try {
      const { page = 1, limit = 20, ...searchParams } = params

      const where = ArticleQueryImpl.buildWhereClause(searchParams)

      const orderBy: Prisma.ArticleOrderByWithRelationInput[] = [
        { createdAt: 'desc' },
        { articleId: 'desc' },
      ]

      const distinct: Prisma.ArticleScalarFieldEnum[] = ['url']

      const [allIds, articles] = await this.db.$transaction([
        // HACK: PrismaではCOUNT DISTINCTが使えないため、一旦distinctなIDリストを取得してからカウントする
        this.db.article.findMany({
          distinct,
          where,
          select: { articleId: true },
        }),
        this.db.article.findMany({
          distinct,
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
      ])

      const total = allIds.length;

      const mappedArticles = articles.map(fromPrismaToArticle)
      const totalPages = Math.ceil(total / limit)

      const result: OffsetPaginationResult<Article> = {
        data: mappedArticles,
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }

      return resultSuccess(result)
    } catch (error) {
      return resultError(new ServerError(error))
    }
  }

  async findArticleById(articleId: bigint): AsyncResult<Nullable<Article>, ServerError> {
    try {
      const article = await this.db.article.findUnique({
        where: { articleId },
      })
      if (!article) return resultSuccess(null)
      return resultSuccess(fromPrismaToArticle(article))
    } catch (error) {
      return resultError(new ServerError(error))
    }
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
