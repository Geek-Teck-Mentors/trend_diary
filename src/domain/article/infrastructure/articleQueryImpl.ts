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
    // activeUserIdがある場合は生SQLでLEFT JOINして1クエリで取得
    if (activeUserId !== undefined) {
      return this.searchArticlesWithReadStatus(params, activeUserId)
    }

    // activeUserIdがない場合は従来通り
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
    const mappedArticles: ArticleWithOptionalReadStatus[] = articles.map((article) => ({
      ...fromPrismaToArticle(article),
      isRead: undefined,
    }))

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

  private async searchArticlesWithReadStatus(
    params: ArticleQueryParams,
    activeUserId: bigint,
  ): AsyncResult<OffsetPaginationResult<ArticleWithOptionalReadStatus>, ServerError> {
    const { page = 1, limit = 20, ...searchParams } = params
    const offset = (page - 1) * limit

    const whereClause = ArticleQueryImpl.buildWhereClauseForRawSql(searchParams)

    const countSql = Prisma.sql`SELECT COUNT(*)::int as count FROM articles a ${whereClause}`
    const dataSql = Prisma.sql`
      SELECT
        a.article_id,
        a.media,
        a.title,
        a.author,
        a.description,
        a.url,
        a.created_at,
        CASE WHEN rh.read_history_id IS NOT NULL THEN true ELSE false END as is_read
      FROM articles a
      LEFT JOIN read_histories rh
        ON a.article_id = rh.article_id
        AND rh.active_user_id = ${activeUserId}
      ${whereClause}
      ORDER BY a.created_at DESC, a.article_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    type CountResult = { count: number }
    type RawDataRow = {
      // biome-ignore lint/style/useNamingConvention: データベースのカラム名
      article_id: bigint
      media: string
      title: string
      author: string
      description: string
      url: string
      // biome-ignore lint/style/useNamingConvention: データベースのカラム名
      created_at: Date
      // biome-ignore lint/style/useNamingConvention: データベースのカラム名
      is_read: boolean
    }

    const result = await wrapAsyncCall(() =>
      this.db.$transaction([
        this.db.$queryRaw<CountResult[]>(countSql),
        this.db.$queryRaw<RawDataRow[]>(dataSql),
      ]),
    )

    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    const [countResult, dataResult] = result.data
    const total = countResult[0]?.count ?? 0

    // 結果をマッピング
    const mappedArticles: ArticleWithOptionalReadStatus[] = dataResult.map((row) => ({
      articleId: row.article_id,
      media: row.media,
      title: row.title,
      author: row.author,
      description: row.description,
      url: row.url,
      createdAt: row.created_at,
      isRead: row.is_read,
    }))

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

  private static buildWhereClauseForRawSql(
    params: Omit<ArticleQueryParams, 'page' | 'limit'>,
  ): Prisma.Sql {
    const conditions: Prisma.Sql[] = []

    if (params.title) {
      conditions.push(Prisma.sql`a.title ILIKE ${`%${params.title}%`}`)
    }

    if (params.author) {
      conditions.push(Prisma.sql`a.author ILIKE ${`%${params.author}%`}`)
    }

    if (params.media) {
      conditions.push(Prisma.sql`a.media = ${params.media}`)
    }

    if (params.from) {
      conditions.push(Prisma.sql`a.created_at >= ${new Date(`${params.from}T00:00:00+09:00`)}`)
    }

    if (params.to) {
      const toDate = new Date(`${params.to}T00:00:00+09:00`)
      toDate.setDate(toDate.getDate() + 1)
      conditions.push(Prisma.sql`a.created_at < ${toDate}`)
    }

    if (conditions.length === 0) {
      return Prisma.empty
    }

    return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
  }
}
