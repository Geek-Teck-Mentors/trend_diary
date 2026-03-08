import { Prisma } from '@prisma/client'
import {
  type AsyncResult,
  failure,
  isFailure,
  type Result,
  success,
  wrapAsyncCall,
} from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { addJstDays, toJstDate } from '@/common/locale/date'
import { DEFAULT_LIMIT, DEFAULT_PAGE, OffsetPaginationResult } from '@/common/pagination'
import { Nullable } from '@/common/types/utility'
import fromPrismaToArticle from '@/domain/article/infrastructure/mapper'
import { ARTICLE_MEDIA, type ArticleMedia } from '@/domain/article/media'
import { Query } from '@/domain/article/repository'
import type { Article, ArticleWithOptionalReadStatus } from '@/domain/article/schema/article-schema'
import type {
  DailyDiary,
  DailyDiaryRangeItem,
  DiaryReadItem,
} from '@/domain/article/schema/diary-schema'
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
  isRead?: number | bigint | boolean | null
}

type RawCountRow = {
  total: number | bigint
}

type RawDiarySourceRow = {
  media: string
  count: number | bigint
}

type RawDiaryDateSourceRow = {
  date: string
  media: string
  count: number | bigint
}

type RawDiaryReadRow = {
  readHistoryId: number | bigint
  articleId: number | bigint
  media: string
  title: string
  url: string
  readAt: string | Date | number | bigint
}

type DateRange = {
  fromDate?: Date
  toDateExclusive?: Date
}

export default class QueryImpl implements Query {
  constructor(private readonly db: RdbClient) {}

  async searchArticles(
    params: QueryParams,
    activeUserId?: bigint,
  ): AsyncResult<OffsetPaginationResult<ArticleWithOptionalReadStatus>, ServerError> {
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, from, to, ...searchParams } = params
    const dbActiveUserId = activeUserId !== undefined ? toDbId(activeUserId) : undefined
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

    const readStatusSql = QueryImpl.buildIsReadSelectSql(dbActiveUserId)

    const articlesResult = await wrapAsyncCall(() =>
      this.db.$queryRaw<RawArticleRow[]>(Prisma.sql`
        SELECT
          article_id as articleId,
          media,
          title,
          author,
          description,
          url,
          created_at as createdAt,
          ${readStatusSql} as isRead
        FROM articles
        ${whereSql}
        ORDER BY ${QueryImpl.getNormalizedDateTimeSql('created_at')} DESC, article_id DESC
        LIMIT ${limit}
        OFFSET ${(page - 1) * limit}
      `),
    )
    if (isFailure(articlesResult)) {
      return failure(new ServerError(articlesResult.error))
    }

    const total = Number(totalResult.data[0]?.total ?? 0)
    const mappedArticles = articlesResult.data.map(QueryImpl.mapRawArticleToDomain)

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

  async getUnreadDigestionArticles(
    activeUserId: bigint,
    targetDateJst: string,
    media?: ArticleMedia,
  ): AsyncResult<Article[], ServerError> {
    const dbActiveUserId = toDbId(activeUserId)
    const { fromDate, toDateExclusive } = QueryImpl.buildDateRange(targetDateJst, targetDateJst)
    if (!fromDate || !toDateExclusive) return success([])
    const createdAtRangeSql = QueryImpl.buildClosedOpenDateRangeSql(
      'created_at',
      fromDate,
      toDateExclusive,
    )

    const mediaCondition = media ? Prisma.sql`AND articles.media = ${media}` : Prisma.empty

    const result = await wrapAsyncCall(() =>
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
        WHERE
          ${createdAtRangeSql}
          AND NOT (${QueryImpl.buildReadHistoryExistsSql(dbActiveUserId)})
          AND NOT EXISTS (
            SELECT 1
            FROM skipped_articles sa
            WHERE sa.article_id = articles.article_id
              AND sa.active_user_id = ${dbActiveUserId}
          )
          ${mediaCondition}
        ORDER BY ${QueryImpl.getNormalizedDateTimeSql('created_at')} DESC, article_id DESC
      `),
    )
    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    return success(result.data.map(QueryImpl.mapRawArticle))
  }

  async getDailyDiary(
    activeUserId: bigint,
    targetDateJst: string,
    page: number,
    limit: number,
  ): AsyncResult<DailyDiary, ServerError> {
    const dbActiveUserId = toDbId(activeUserId)
    const { fromDate, toDateExclusive } = QueryImpl.buildDateRange(targetDateJst, targetDateJst)
    const readAtRangeSql = QueryImpl.buildClosedOpenDateRangeSql(
      'rh.read_at',
      fromDate,
      toDateExclusive,
    )
    const skipAtRangeSql = QueryImpl.buildClosedOpenDateRangeSql(
      'sa.created_at',
      fromDate,
      toDateExclusive,
    )

    const queryResultTuple = await Promise.all([
      wrapAsyncCall(() =>
        this.db.$queryRaw<RawDiarySourceRow[]>(Prisma.sql`
            SELECT
              a.media as media,
              COUNT(*) as count
            FROM read_histories rh
            INNER JOIN articles a ON a.article_id = rh.article_id
            WHERE
              rh.active_user_id = ${dbActiveUserId}
              AND ${readAtRangeSql}
            GROUP BY a.media
            ORDER BY count DESC, a.media ASC
          `),
      ),
      wrapAsyncCall(() =>
        this.db.$queryRaw<RawDiarySourceRow[]>(Prisma.sql`
            SELECT
              a.media as media,
              COUNT(*) as count
            FROM skipped_articles sa
            INNER JOIN articles a ON a.article_id = sa.article_id
            WHERE
              sa.active_user_id = ${dbActiveUserId}
              AND ${skipAtRangeSql}
            GROUP BY a.media
            ORDER BY count DESC, a.media ASC
          `),
      ),
      wrapAsyncCall(() =>
        this.db.$queryRaw<RawDiaryReadRow[]>(Prisma.sql`
            SELECT
              rh.read_history_id as readHistoryId,
              rh.article_id as articleId,
              a.media as media,
              a.title as title,
              a.url as url,
              rh.read_at as readAt
            FROM read_histories rh
            INNER JOIN articles a ON a.article_id = rh.article_id
            WHERE
              rh.active_user_id = ${dbActiveUserId}
              AND ${readAtRangeSql}
            ORDER BY ${QueryImpl.getNormalizedDateTimeSql('rh.read_at')} DESC, rh.read_history_id DESC
            LIMIT ${limit}
            OFFSET ${(page - 1) * limit}
          `),
      ),
    ])
    const resolvedQueryResults = QueryImpl.unwrapResultTuple(queryResultTuple)
    if (isFailure(resolvedQueryResults)) {
      return failure(resolvedQueryResults.error)
    }

    const [readSourcesRows, skipSourcesRows, readsRows] = resolvedQueryResults.data
    const readCount = QueryImpl.sumDiarySourceCounts(readSourcesRows)
    const skipCount = QueryImpl.sumDiarySourceCounts(skipSourcesRows)
    const readsTotal = readCount
    const totalPages = Math.ceil(readsTotal / limit)

    return success({
      date: targetDateJst,
      summary: {
        read: readCount,
        skip: skipCount,
      },
      sources: QueryImpl.mergeDiarySources(readSourcesRows, skipSourcesRows),
      reads: {
        data: readsRows.map(QueryImpl.mapRawDiaryReadItem),
        page,
        limit,
        total: readsTotal,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  }

  async getDailyDiaryRange(
    activeUserId: bigint,
    fromDateJst: string,
    toDateJst: string,
  ): AsyncResult<DailyDiaryRangeItem[], ServerError> {
    const dbActiveUserId = toDbId(activeUserId)
    const { fromDate, toDateExclusive } = QueryImpl.buildDateRange(fromDateJst, toDateJst)
    if (!fromDate || !toDateExclusive) return success([])
    const readAtRangeSql = QueryImpl.buildClosedOpenDateRangeSql(
      'rh.read_at',
      fromDate,
      toDateExclusive,
    )
    const skipAtRangeSql = QueryImpl.buildClosedOpenDateRangeSql(
      'sa.created_at',
      fromDate,
      toDateExclusive,
    )
    const readAtJstDateSql = QueryImpl.getJstDateSql('rh.read_at')
    const skipAtJstDateSql = QueryImpl.getJstDateSql('sa.created_at')

    const sourceResultTuple = await Promise.all([
      wrapAsyncCall(() =>
        this.db.$queryRaw<RawDiaryDateSourceRow[]>(Prisma.sql`
          SELECT
            ${readAtJstDateSql} as date,
            a.media as media,
            COUNT(*) as count
          FROM read_histories rh
          INNER JOIN articles a ON a.article_id = rh.article_id
          WHERE
            rh.active_user_id = ${dbActiveUserId}
            AND ${readAtRangeSql}
          GROUP BY ${readAtJstDateSql}, a.media
        `),
      ),
      wrapAsyncCall(() =>
        this.db.$queryRaw<RawDiaryDateSourceRow[]>(Prisma.sql`
          SELECT
            ${skipAtJstDateSql} as date,
            a.media as media,
            COUNT(*) as count
          FROM skipped_articles sa
          INNER JOIN articles a ON a.article_id = sa.article_id
          WHERE
            sa.active_user_id = ${dbActiveUserId}
            AND ${skipAtRangeSql}
          GROUP BY ${skipAtJstDateSql}, a.media
        `),
      ),
    ])
    const resolvedSourceResults = QueryImpl.unwrapResultTuple(sourceResultTuple)
    if (isFailure(resolvedSourceResults)) {
      return failure(resolvedSourceResults.error)
    }
    const [readSourceRows, skipSourceRows] = resolvedSourceResults.data

    const readByDate = QueryImpl.groupSourcesByDate(readSourceRows)
    const skipByDate = QueryImpl.groupSourcesByDate(skipSourceRows)
    const dates = QueryImpl.enumerateJstDateRange(fromDateJst, toDateJst)

    return success(
      dates.map((date) => {
        const sources = QueryImpl.mergeDiarySources(
          readByDate.get(date) ?? [],
          skipByDate.get(date) ?? [],
        )
        const summary = sources.reduce(
          (acc, source) => ({
            read: acc.read + source.read,
            skip: acc.skip + source.skip,
          }),
          { read: 0, skip: 0 },
        )
        return { date, summary, sources }
      }),
    )
  }

  private static getNormalizedDateTimeSql(columnName: string) {
    const column = Prisma.raw(columnName)
    // INFO: typeof()はSQLite固有関数。timestampの型揺れ(integer/text)を吸収するためSQLite前提で正規化する
    return Prisma.sql`
      CASE
        WHEN typeof(${column}) = 'integer' THEN datetime(${column} / 1000, 'unixepoch')
        ELSE datetime(${column})
      END
    `
  }

  private static getJstDateSql(columnName: string) {
    return Prisma.sql`date(${QueryImpl.getNormalizedDateTimeSql(columnName)}, '+9 hours')`
  }

  private static buildClosedOpenDateRangeSql(
    columnName: string,
    fromDate: Date,
    toDateExclusive: Date,
  ) {
    const normalizedDateTime = QueryImpl.getNormalizedDateTimeSql(columnName)
    return Prisma.sql`
      ${normalizedDateTime} >= datetime(${fromDate.toISOString()})
      AND ${normalizedDateTime} < datetime(${toDateExclusive.toISOString()})
    `
  }

  private static buildDateRangeConditions(
    columnName: string,
    { fromDate, toDateExclusive }: DateRange,
  ) {
    const normalizedDateTime = QueryImpl.getNormalizedDateTimeSql(columnName)
    const conditions: Prisma.Sql[] = []
    if (fromDate) {
      conditions.push(Prisma.sql`${normalizedDateTime} >= datetime(${fromDate.toISOString()})`)
    }
    if (toDateExclusive) {
      conditions.push(
        Prisma.sql`${normalizedDateTime} < datetime(${toDateExclusive.toISOString()})`,
      )
    }
    return conditions
  }

  private static buildReadHistoryExistsSql(activeUserId: number) {
    return Prisma.sql`
      EXISTS (
        SELECT 1
        FROM read_histories rh
        WHERE rh.article_id = articles.article_id
          AND rh.active_user_id = ${activeUserId}
      )
    `
  }

  private static buildIsReadSelectSql(activeUserId?: number) {
    if (activeUserId === undefined) return Prisma.sql`NULL`
    return QueryImpl.buildReadHistoryExistsSql(activeUserId)
  }

  private static buildReadStatusCondition(readStatus: boolean, activeUserId: number) {
    const readExistsSql = QueryImpl.buildReadHistoryExistsSql(activeUserId)
    return readStatus ? readExistsSql : Prisma.sql`NOT (${readExistsSql})`
  }

  private static unwrapResultTuple<T extends readonly unknown[]>(
    results: { [K in keyof T]: Result<T[K], Error> },
  ): Result<T, ServerError> {
    const firstFailure = results.find(isFailure)
    if (firstFailure) {
      return failure(new ServerError(firstFailure.error))
    }
    const successResults = results as unknown as { [K in keyof T]: { data: T[K] } }
    return success(successResults.map((result) => result.data) as unknown as T)
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
    conditions.push(
      ...QueryImpl.buildDateRangeConditions('created_at', { fromDate, toDateExclusive }),
    )

    if (readStatus !== undefined && activeUserId !== undefined) {
      conditions.push(QueryImpl.buildReadStatusCondition(readStatus, activeUserId))
    }

    if (conditions.length === 0) {
      return Prisma.empty
    }

    return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
  }

  private static buildDateRange(
    from: string,
    to: string,
  ): {
    fromDate: Date
    toDateExclusive: Date
  }
  private static buildDateRange(from?: string, to?: string): DateRange
  private static buildDateRange(from?: string, to?: string): DateRange {
    // INFO: APIの指定日はJST日付として扱う
    const fromDate = from ? toJstDate(from) : undefined
    const toDateExclusive = to ? toJstDate(to) : undefined
    if (toDateExclusive) {
      toDateExclusive.setDate(toDateExclusive.getDate() + 1)
    }
    return { fromDate, toDateExclusive }
  }

  private static mapRawArticleToDomain(row: RawArticleRow): ArticleWithOptionalReadStatus {
    const article = QueryImpl.mapRawArticle(row)

    return {
      ...article,
      isRead: row.isRead === null || row.isRead === undefined ? undefined : Boolean(row.isRead),
    }
  }

  private static mapRawArticle(row: RawArticleRow): Article {
    return {
      articleId: fromDbId(row.articleId),
      media: row.media,
      title: row.title,
      author: row.author,
      description: row.description,
      url: row.url,
      createdAt: QueryImpl.convertRawDateTime(row.createdAt),
    }
  }

  private static mapRawDiaryReadItem(row: RawDiaryReadRow): DiaryReadItem {
    return {
      readHistoryId: fromDbId(row.readHistoryId),
      articleId: fromDbId(row.articleId),
      media: row.media as ArticleMedia,
      title: row.title,
      url: row.url,
      readAt: QueryImpl.convertRawDateTime(row.readAt),
    }
  }

  private static groupSourcesByDate(rows: RawDiaryDateSourceRow[]) {
    const grouped = new Map<string, RawDiarySourceRow[]>()
    for (const row of rows) {
      const current = grouped.get(row.date) ?? []
      current.push({ media: row.media, count: row.count })
      grouped.set(row.date, current)
    }
    return grouped
  }

  private static sumDiarySourceCounts(rows: RawDiarySourceRow[]) {
    return rows.reduce((sum, row) => sum + Number(row.count), 0)
  }

  private static mergeDiarySources(readRows: RawDiarySourceRow[], skipRows: RawDiarySourceRow[]) {
    const readMap = new Map(readRows.map((row) => [row.media as ArticleMedia, Number(row.count)]))
    const skipMap = new Map(skipRows.map((row) => [row.media as ArticleMedia, Number(row.count)]))

    return ARTICLE_MEDIA.map((media) => ({
      media,
      read: readMap.get(media) ?? 0,
      skip: skipMap.get(media) ?? 0,
    }))
  }

  private static convertRawDateTime(rawDateTime: string | Date | number | bigint): Date {
    if (rawDateTime instanceof Date) {
      return rawDateTime
    }
    if (typeof rawDateTime === 'bigint') {
      return new Date(Number(rawDateTime))
    }
    return new Date(rawDateTime)
  }

  private static enumerateJstDateRange(fromDateJst: string, toDateJst: string) {
    const dates: string[] = []
    let current = fromDateJst
    while (current <= toDateJst) {
      dates.push(current)
      const next = addJstDays(current, 1)
      if (isFailure(next)) break
      current = next.data
    }
    return dates
  }
}
