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

type RawArticleRow = {
  articleId: number | bigint
  media: string
  title: string
  author: string
  description: string
  url: string
  createdAt: string | Date | number | bigint
}

type RawCountRow = {
  total: number | bigint
}

export default class QueryImpl implements Query {
  constructor(private readonly db: RdbClient) {}

  async searchArticles(
    params: QueryParams,
    activeUserId?: bigint,
  ): AsyncResult<OffsetPaginationResult<ArticleWithOptionalReadStatus>, ServerError> {
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, from, to, ...searchParams } = params
    const orderBy: Prisma.ArticleOrderByWithRelationInput[] = [
      { createdAt: 'desc' },
      { articleId: 'desc' },
    ]

    let total = 0
    let mappedArticles: ArticleWithOptionalReadStatus[] = []
    const dbActiveUserId = activeUserId !== undefined ? toDbId(activeUserId) : undefined
    const useRawSql =
      Boolean(from || to) || (searchParams.readStatus !== undefined && dbActiveUserId !== undefined)

    if (useRawSql) {
      const whereSql = QueryImpl.buildSqlWhereClause({
        title: searchParams.title,
        author: searchParams.author,
        media: searchParams.media,
        from,
        to,
        readStatus: searchParams.readStatus,
        activeUserId: dbActiveUserId,
      })

      const totalResult = await wrapAsyncCall(() =>
        this.db.$queryRaw<RawCountRow[]>(Prisma.sql`
          SELECT COUNT(*) as total
          FROM articles
          ${whereSql}
        `),
      )
      if (isFailure(totalResult)) {
        return failure(new ServerError(totalResult.error))
      }

      const articlesResult = await wrapAsyncCall(() =>
        this.db.$queryRaw<RawArticleRow[]>(Prisma.sql`
          SELECT
            article_id as articleId,
            media,
            title,
            author,
            description,
            url,
            created_at as createdAt
          FROM articles
          ${whereSql}
          ORDER BY ${QueryImpl.getNormalizedCreatedAtSql()} DESC, article_id DESC
          LIMIT ${limit}
          OFFSET ${(page - 1) * limit}
        `),
      )
      if (isFailure(articlesResult)) {
        return failure(new ServerError(articlesResult.error))
      }

      total = Number(totalResult.data[0]?.total ?? 0)
      mappedArticles = articlesResult.data.map(QueryImpl.mapRawArticleToDomain)
    } else {
      const where = QueryImpl.buildWhereClause(searchParams)
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

      total = totalResult.data
      mappedArticles = articlesResult.data.map(fromPrismaToArticle)
    }

    if (activeUserId !== undefined && mappedArticles.length > 0) {
      const readHistoriesResult = await wrapAsyncCall(() =>
        this.db.readHistory.findMany({
          where: {
            activeUserId: toDbId(activeUserId),
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

  private static buildWhereClause(params: Omit<QueryParams, 'page' | 'limit' | 'from' | 'to'>) {
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

    return where
  }

  private static getNormalizedCreatedAtSql() {
    // INFO: created_atはSQLiteでinteger(text含む)が混在しうるため正規化して比較する
    return Prisma.sql`
      CASE
        WHEN typeof(created_at) = 'integer' THEN datetime(created_at / 1000, 'unixepoch')
        ELSE datetime(created_at)
      END
    `
  }

  private static buildSqlWhereClause(params: {
    title?: string
    author?: string
    media?: string
    from?: string
    to?: string
    readStatus?: boolean
    activeUserId?: number
  }) {
    const { title, author, media, from, to, readStatus, activeUserId } = params
    const conditions: Prisma.Sql[] = []

    if (title) {
      conditions.push(Prisma.sql`title LIKE ${`%${title}%`}`)
    }
    if (author) {
      conditions.push(Prisma.sql`author LIKE ${`%${author}%`}`)
    }
    if (media) {
      conditions.push(Prisma.sql`media = ${media}`)
    }

    const { fromDate, toDateExclusive } = QueryImpl.buildDateRange(from, to)
    if (fromDate) {
      conditions.push(
        Prisma.sql`${QueryImpl.getNormalizedCreatedAtSql()} >= datetime(${fromDate.toISOString()})`,
      )
    }
    if (toDateExclusive) {
      conditions.push(
        Prisma.sql`${QueryImpl.getNormalizedCreatedAtSql()} < datetime(${toDateExclusive.toISOString()})`,
      )
    }

    if (readStatus !== undefined && activeUserId !== undefined) {
      if (readStatus) {
        conditions.push(Prisma.sql`
          EXISTS (
            SELECT 1
            FROM read_histories rh
            WHERE rh.article_id = articles.article_id
              AND rh.active_user_id = ${activeUserId}
          )
        `)
      } else {
        conditions.push(Prisma.sql`
          NOT EXISTS (
            SELECT 1
            FROM read_histories rh
            WHERE rh.article_id = articles.article_id
              AND rh.active_user_id = ${activeUserId}
          )
        `)
      }
    }

    if (conditions.length === 0) {
      return Prisma.empty
    }

    return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
  }

  private static buildDateRange(from?: string, to?: string) {
    // INFO: APIの指定日はJST日付として扱う
    const fromDate = from ? new Date(`${from}T00:00:00+09:00`) : undefined
    const toDateExclusive = to ? new Date(`${to}T00:00:00+09:00`) : undefined
    if (toDateExclusive) {
      toDateExclusive.setDate(toDateExclusive.getDate() + 1)
    }
    return { fromDate, toDateExclusive }
  }

  private static mapRawArticleToDomain(row: RawArticleRow): ArticleWithOptionalReadStatus {
    let createdAt: Date
    if (row.createdAt instanceof Date) {
      createdAt = row.createdAt
    } else if (typeof row.createdAt === 'bigint') {
      createdAt = new Date(Number(row.createdAt))
    } else {
      createdAt = new Date(row.createdAt)
    }

    return {
      articleId: fromDbId(row.articleId),
      media: row.media,
      title: row.title,
      author: row.author,
      description: row.description,
      url: row.url,
      createdAt,
      isRead: undefined,
    }
  }
}
