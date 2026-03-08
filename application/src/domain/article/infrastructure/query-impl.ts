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
import { addJstDays } from '@/common/locale/date'
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

    const readStatusSql =
      dbActiveUserId !== undefined
        ? Prisma.sql`
            EXISTS (
              SELECT 1
              FROM read_histories rh
              WHERE rh.article_id = articles.article_id
                AND rh.active_user_id = ${dbActiveUserId}
            )
          `
        : Prisma.sql`NULL`

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
        ORDER BY ${QueryImpl.getNormalizedCreatedAtSql()} DESC, article_id DESC
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
          ${QueryImpl.getNormalizedCreatedAtSql()} >= datetime(${fromDate.toISOString()})
          AND ${QueryImpl.getNormalizedCreatedAtSql()} < datetime(${toDateExclusive.toISOString()})
          AND NOT EXISTS (
            SELECT 1
            FROM read_histories rh
            WHERE rh.article_id = articles.article_id
              AND rh.active_user_id = ${dbActiveUserId}
          )
          AND NOT EXISTS (
            SELECT 1
            FROM skipped_articles sa
            WHERE sa.article_id = articles.article_id
              AND sa.active_user_id = ${dbActiveUserId}
          )
          ${mediaCondition}
        ORDER BY ${QueryImpl.getNormalizedCreatedAtSql()} DESC, article_id DESC
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
    if (!fromDate || !toDateExclusive) {
      return success({
        date: targetDateJst,
        summary: { read: 0, skip: 0 },
        sources: [],
        reads: {
          data: [],
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      })
    }

    const queryResultTuple = await Promise.all([
      wrapAsyncCall(() =>
        this.db.$queryRaw<RawCountRow[]>(Prisma.sql`
            SELECT COUNT(*) as total
            FROM read_histories
            WHERE
              active_user_id = ${dbActiveUserId}
              AND ${QueryImpl.getNormalizedDateTimeSql('read_at')} >= datetime(${fromDate.toISOString()})
              AND ${QueryImpl.getNormalizedDateTimeSql('read_at')} < datetime(${toDateExclusive.toISOString()})
          `),
      ),
      wrapAsyncCall(() =>
        this.db.$queryRaw<RawCountRow[]>(Prisma.sql`
            SELECT COUNT(*) as total
            FROM skipped_articles
            WHERE
              active_user_id = ${dbActiveUserId}
              AND ${QueryImpl.getNormalizedDateTimeSql('created_at')} >= datetime(${fromDate.toISOString()})
              AND ${QueryImpl.getNormalizedDateTimeSql('created_at')} < datetime(${toDateExclusive.toISOString()})
          `),
      ),
      wrapAsyncCall(() =>
        this.db.$queryRaw<RawDiarySourceRow[]>(Prisma.sql`
            SELECT
              a.media as media,
              COUNT(*) as count
            FROM read_histories rh
            INNER JOIN articles a ON a.article_id = rh.article_id
            WHERE
              rh.active_user_id = ${dbActiveUserId}
              AND ${QueryImpl.getNormalizedDateTimeSql('rh.read_at')} >= datetime(${fromDate.toISOString()})
              AND ${QueryImpl.getNormalizedDateTimeSql('rh.read_at')} < datetime(${toDateExclusive.toISOString()})
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
              AND ${QueryImpl.getNormalizedDateTimeSql('sa.created_at')} >= datetime(${fromDate.toISOString()})
              AND ${QueryImpl.getNormalizedDateTimeSql('sa.created_at')} < datetime(${toDateExclusive.toISOString()})
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
              AND ${QueryImpl.getNormalizedDateTimeSql('rh.read_at')} >= datetime(${fromDate.toISOString()})
              AND ${QueryImpl.getNormalizedDateTimeSql('rh.read_at')} < datetime(${toDateExclusive.toISOString()})
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

    const [readCountRows, skipCountRows, readSourcesRows, skipSourcesRows, readsRows] =
      resolvedQueryResults.data

    const readCount = Number(readCountRows[0]?.total ?? 0)
    const skipCount = Number(skipCountRows[0]?.total ?? 0)
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

    const sourceResultTuple = await Promise.all([
      wrapAsyncCall(() =>
        this.db.$queryRaw<RawDiaryDateSourceRow[]>(Prisma.sql`
          SELECT
            date(${QueryImpl.getNormalizedDateTimeSql('rh.read_at')}, '+9 hours') as date,
            a.media as media,
            COUNT(*) as count
          FROM read_histories rh
          INNER JOIN articles a ON a.article_id = rh.article_id
          WHERE
            rh.active_user_id = ${dbActiveUserId}
            AND ${QueryImpl.getNormalizedDateTimeSql('rh.read_at')} >= datetime(${fromDate.toISOString()})
            AND ${QueryImpl.getNormalizedDateTimeSql('rh.read_at')} < datetime(${toDateExclusive.toISOString()})
          GROUP BY date(${QueryImpl.getNormalizedDateTimeSql('rh.read_at')}, '+9 hours'), a.media
        `),
      ),
      wrapAsyncCall(() =>
        this.db.$queryRaw<RawDiaryDateSourceRow[]>(Prisma.sql`
          SELECT
            date(${QueryImpl.getNormalizedDateTimeSql('sa.created_at')}, '+9 hours') as date,
            a.media as media,
            COUNT(*) as count
          FROM skipped_articles sa
          INNER JOIN articles a ON a.article_id = sa.article_id
          WHERE
            sa.active_user_id = ${dbActiveUserId}
            AND ${QueryImpl.getNormalizedDateTimeSql('sa.created_at')} >= datetime(${fromDate.toISOString()})
            AND ${QueryImpl.getNormalizedDateTimeSql('sa.created_at')} < datetime(${toDateExclusive.toISOString()})
          GROUP BY date(${QueryImpl.getNormalizedDateTimeSql('sa.created_at')}, '+9 hours'), a.media
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

  private static getNormalizedCreatedAtSql() {
    // INFO: created_atはSQLiteでinteger(text含む)が混在しうるため正規化して比較する
    return Prisma.sql`
      CASE
        WHEN typeof(created_at) = 'integer' THEN datetime(created_at / 1000, 'unixepoch')
        ELSE datetime(created_at)
      END
    `
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
