import { PrismaClient, Prisma } from '@prisma/client';
import Article from '@/domain/article/article';
import { ArticleQueryService } from '@/domain/article/repository/articleQueryService';
import { ArticleQueryParams } from '@/domain/article/schema/articleQuerySchema';
import { ServerError } from '@/common/errors';
import { AsyncResult, resultSuccess, resultError } from '@/common/types/utility';
import fromPrismaToArticle from '@/domain/article/mapper/articleMapper';
import getErrorMessage from '@/common/utils/errorUtils';

export default class ArticleQueryServiceImpl implements ArticleQueryService {
  constructor(private readonly db: PrismaClient) {}

  async searchArticles(params: ArticleQueryParams): AsyncResult<Article[], ServerError> {
    try {
      const articles = await this.db.article.findMany({
        where: ArticleQueryServiceImpl.buildWhereClause(params),
        orderBy: { createdAt: 'desc' },
      });

      return resultSuccess(articles.map(fromPrismaToArticle));
    } catch (error) {
      return resultError(new ServerError(getErrorMessage(error)));
    }
  }

  private static buildWhereClause(params: ArticleQueryParams): Prisma.ArticleWhereInput {
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
