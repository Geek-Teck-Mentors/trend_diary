import { PrismaClient } from '@prisma/client';
import Article from '@/domain/article/model/article';
import { ArticleRepository } from '@/domain/article/repository/articleRepository';
import { ServerError } from '@/common/errors';
import { AsyncResult, resultSuccess, resultError } from '@/common/types/utility';
import fromPrismaToArticle from '@/domain/article/mapper/articleMapper';
import getErrorMessage from '@/common/utils/errorUtils';

export default class ArticleRepositoryImpl implements ArticleRepository {
  constructor(private readonly db: PrismaClient) {}

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

  async create(
    articleData: Omit<Article, 'articleId' | 'createdAt'>,
  ): AsyncResult<Article, ServerError> {
    try {
      const article = await this.db.article.create({
        data: {
          media: articleData.media,
          title: articleData.title,
          author: articleData.author,
          description: articleData.description,
          url: articleData.url,
        },
      });

      return resultSuccess(fromPrismaToArticle(article));
    } catch (error) {
      return resultError(new ServerError(getErrorMessage(error)));
    }
  }

  async update(id: bigint, updateData: Partial<Article>): AsyncResult<Article, ServerError> {
    try {
      const article = await this.db.article.update({
        where: { articleId: id },
        data: {
          ...(updateData.media && { media: updateData.media }),
          ...(updateData.title && { title: updateData.title }),
          ...(updateData.author && { author: updateData.author }),
          ...(updateData.description && { description: updateData.description }),
          ...(updateData.url && { url: updateData.url }),
        },
      });

      return resultSuccess(fromPrismaToArticle(article));
    } catch (error) {
      return resultError(new ServerError(getErrorMessage(error)));
    }
  }

  async delete(id: bigint): AsyncResult<void, ServerError> {
    try {
      await this.db.article.delete({
        where: { articleId: id },
      });

      return resultSuccess(undefined);
    } catch (error) {
      return resultError(new ServerError(getErrorMessage(error)));
    }
  }
}
