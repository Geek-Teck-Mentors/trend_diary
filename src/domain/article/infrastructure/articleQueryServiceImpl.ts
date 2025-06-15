import { Prisma } from '@prisma/client';
import Article from '@/domain/article/model/article';
import { ArticleQueryService } from '@/domain/article/repository/articleQueryService';
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema';
import { ServerError } from '@/common/errors';
import { AsyncResult, resultSuccess, resultError } from '@/common/types/utility';
import fromPrismaToArticle from '@/domain/article/mapper/articleMapper';
import getErrorMessage from '@/common/utils/errorUtils';
import { RdbClient } from '@/infrastructure/rdb';
import {
  CursorPaginationResult,
  decodeCursor,
  createPaginationResult,
  CursorDirection,
} from '@/common/pagination';

export default class ArticleQueryServiceImpl implements ArticleQueryService {
  constructor(private readonly db: RdbClient) {}

  async findById(id: bigint): AsyncResult<Article | null, ServerError> {
    try {
      const article = await this.db.article.findUnique({
        where: { articleId: id },
      });

      return resultSuccess(article ? fromPrismaToArticle(article) : null);
    } catch (error) {
      return resultError(new ServerError(getErrorMessage(error)));
    }
  }

  async findAll(): AsyncResult<Article[], ServerError> {
    try {
      const articles = await this.db.article.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return resultSuccess(articles.map(fromPrismaToArticle));
    } catch (error) {
      return resultError(new ServerError(getErrorMessage(error)));
    }
  }

  async searchArticles(
    params: ArticleQueryParams,
  ): AsyncResult<CursorPaginationResult<Article>, ServerError> {
    try {
      const { cursor, limit = 20, direction = 'next', ...searchParams } = params;

      const where = ArticleQueryServiceImpl.buildWhereClause(searchParams);
      const cursorCondition = ArticleQueryServiceImpl.buildCursorCondition(cursor, direction);

      if (cursorCondition) {
        let existingAnd: any[] = [];
        if (where.AND) {
          existingAnd = Array.isArray(where.AND) ? where.AND : [where.AND];
        }
        where.AND = [...existingAnd, cursorCondition];
      }

      const orderBy: Prisma.ArticleOrderByWithRelationInput[] = [
        { createdAt: direction === 'next' ? 'desc' : 'asc' },
        { articleId: direction === 'next' ? 'desc' : 'asc' },
      ];

      const articles = await this.db.article.findMany({
        where,
        orderBy,
        take: limit + 1,
      });

      let mappedArticles = articles.map(fromPrismaToArticle);

      if (direction === 'prev') {
        mappedArticles = mappedArticles.reverse();
      }

      const paginationResult = createPaginationResult(mappedArticles, limit, direction, !!cursor);

      return resultSuccess(paginationResult);
    } catch (error) {
      return resultError(new ServerError(getErrorMessage(error)));
    }
  }

  private static buildCursorCondition(
    cursor: string | undefined,
    direction: CursorDirection,
  ): Prisma.ArticleWhereInput | null {
    if (!cursor) return null;

    try {
      const cursorInfo = decodeCursor(cursor);

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
        };
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
      };
    } catch {
      return null;
    }
  }

  private static buildWhereClause(
    params: Omit<ArticleQueryParams, 'cursor' | 'limit' | 'direction'>,
  ): Prisma.ArticleWhereInput {
    const where: Prisma.ArticleWhereInput = {};

    if (params.title) {
      where.title = {
        contains: params.title,
        mode: 'insensitive',
      };
    }

    if (params.author) {
      where.author = {
        contains: params.author,
        mode: 'insensitive',
      };
    }

    if (params.media) {
      where.media = params.media;
    }

    if (params.date) {
      const startDate = new Date(`${params.date}T00:00:00Z`);
      const endDate = new Date(`${params.date}T00:00:00Z`);
      endDate.setDate(endDate.getDate() + 1);

      where.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    return where;
  }
}
