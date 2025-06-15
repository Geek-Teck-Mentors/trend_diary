import Article from '@/domain/article/model/article';
import { ArticleCommandService } from '@/domain/article/repository/articleCommandService';
import { ServerError, getErrorMessage } from '@/common/errors';
import { AsyncResult, resultSuccess, resultError } from '@/common/types/utility';
import fromPrismaToArticle from '@/domain/article/mapper/articleMapper';
import { RdbClient } from '@/infrastructure/rdb';

export default class ArticleCommandServiceImpl implements ArticleCommandService {
  constructor(private readonly db: RdbClient) {}

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

  async save(id: bigint, updateData: Partial<Article>): AsyncResult<Article, ServerError> {
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
