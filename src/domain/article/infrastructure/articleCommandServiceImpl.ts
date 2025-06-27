import { ArticleCommandService } from '@/domain/article/repository/articleCommandService';
import ReadHistory from '@/domain/article/model/readHistory';
import { AsyncResult, resultSuccess, resultError } from '@/common/types/utility';
import { ServerError, getErrorMessage } from '@/common/errors';
import { RdbClient } from '@/infrastructure/rdb';

export default class ArticleCommandServiceImpl implements ArticleCommandService {
  constructor(private readonly db: RdbClient) {}

  async createReadHistory(
    userId: bigint,
    articleId: bigint,
    readAt: Date,
  ): AsyncResult<ReadHistory, Error> {
    try {
      const createdReadHistory = await this.db.readHistory.create({
        data: {
          userId,
          articleId,
          readAt,
        },
      });

      const readHistory = new ReadHistory(
        createdReadHistory.readHistoryId,
        createdReadHistory.userId,
        createdReadHistory.articleId,
        createdReadHistory.readAt,
        createdReadHistory.createdAt,
      );

      return resultSuccess(readHistory);
    } catch (error) {
      return resultError(new ServerError(getErrorMessage(error)));
    }
  }

  async deleteAllReadHistory(userId: bigint, articleId: bigint): AsyncResult<void, Error> {
    try {
      await this.db.readHistory.deleteMany({
        where: {
          userId,
          articleId,
        },
      });

      return resultSuccess(undefined);
    } catch (error) {
      return resultError(new ServerError(getErrorMessage(error)));
    }
  }
}
