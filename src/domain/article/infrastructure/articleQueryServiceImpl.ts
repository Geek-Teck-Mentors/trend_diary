import { Prisma } from '@prisma/client'
import { getErrorMessage, ServerError } from '@/common/errors'
import {
  CursorDirection,
  CursorPaginationResult,
  createPaginationResult,
  decodeCursor,
} from '@/common/pagination'
import { AsyncResult, Nullable, resultError, resultSuccess } from '@/common/types/utility'
import fromPrismaToArticle from '@/domain/article/infrastructure/articleMapper'
import Article from '@/domain/article/model/article'
import { ArticleQueryService } from '@/domain/article/repository/articleQueryService'
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema'
import { RdbClient } from '@/infrastructure/rdb'

export default class ArticleQueryServiceImpl implements ArticleQueryService {
  constructor(private readonly db: RdbClient) {}

  async searchArticles(
    params: ArticleQueryParams,
  ): AsyncResult<CursorPaginationResult<Article>, ServerError> {
    try {
      const { cursor, limit = 20, direction = 'next', ...searchParams } = params

      const where = ArticleQueryServiceImpl.buildWhereClause(searchParams)
      const cursorCondition = ArticleQueryServiceImpl.buildCursorCondition(direction, cursor)

      if (cursorCondition) {
        let existingAnd: any[] = []
        if (where.AND) {
          existingAnd = Array.isArray(where.AND) ? where.AND : [where.AND]
        }
        where.AND = [...existingAnd, cursorCondition]
      }

      const orderBy: Prisma.ArticleOrderByWithRelationInput[] = [
        { createdAt: direction === 'next' ? 'desc' : 'asc' },
        { articleId: direction === 'next' ? 'desc' : 'asc' },
      ]

      const articles = await this.db.article.findMany({
        where,
        orderBy,
        take: limit + 1,
      })

      let mappedArticles = articles.map(fromPrismaToArticle)

      if (direction === 'prev') {
        mappedArticles = mappedArticles.reverse()
      }

      const paginationResult = createPaginationResult(
        mappedArticles,
        limit,
        (article) => article.articleId,
        direction,
        !!cursor,
      )

      return resultSuccess(paginationResult)
    } catch (error) {
      return resultError(new ServerError(getErrorMessage(error)))
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
      return resultError(new ServerError(getErrorMessage(error)))
    }
  }

  private static buildCursorCondition(
    direction: CursorDirection,
    cursor?: string,
  ): Nullable<Prisma.ArticleWhereInput> {
    if (!cursor) return null

    try {
      const cursorInfo = decodeCursor(cursor)

      if (direction === 'next') {
        return {
          OR: [
            {
              createdAt: { lt: cursorInfo.createdAt },
            },
            {
              createdAt: cursorInfo.createdAt,
              articleId: { lt: cursorInfo.id },
            },
          ],
        }
      }

      return {
        OR: [
          {
            createdAt: { gt: cursorInfo.createdAt },
          },
          {
            createdAt: cursorInfo.createdAt,
            articleId: { gt: cursorInfo.id },
          },
        ],
      }
    } catch {
      return null
    }
  }

  private static buildWhereClause(
    params: Omit<ArticleQueryParams, 'cursor' | 'limit' | 'direction'>,
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

    // TODO: readStatusによるフィルタリングは将来実装予定
    // if (params.readStatus !== undefined) {
    //   if (params.readStatus === true) {
    //     where.readHistories = {
    //       some: {},
    //     }
    //   } else {
    //     where.readHistories = {
    //       none: {},
    //     }
    //   }
    // }

    return where
  }
}
