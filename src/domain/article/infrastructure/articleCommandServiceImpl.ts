import { getErrorMessage, ServerError } from '@/common/errors'
import { AsyncResult, resultError, resultSuccess } from '@/common/types/utility'
import ReadHistory from '@/domain/article/model/readHistory'
import { ArticleCommandService } from '@/domain/article/repository/articleCommandService'
import { RdbClient } from '@/infrastructure/rdb'

export default class ArticleCommandServiceImpl implements ArticleCommandService {
  constructor(private readonly db: RdbClient) {}

  async createReadHistory(
    activeUserId: bigint,
    articleId: bigint,
    readAt: Date,
  ): AsyncResult<ReadHistory, Error> {
    try {
      const createdReadHistory = await this.db.readHistory.create({
        data: {
          activeUserId,
          articleId,
          readAt,
        },
      })

      const readHistory: ReadHistory = {
        readHistoryId: createdReadHistory.readHistoryId,
        activeUserId: createdReadHistory.activeUserId,
        articleId: createdReadHistory.articleId,
        readAt: createdReadHistory.readAt,
        createdAt: createdReadHistory.createdAt,
      }

      return resultSuccess(readHistory)
    } catch (error) {
      return resultError(new ServerError(getErrorMessage(error)))
    }
  }

  async deleteAllReadHistory(activeUserId: bigint, articleId: bigint): AsyncResult<void, Error> {
    try {
      await this.db.readHistory.deleteMany({
        where: {
          activeUserId,
          articleId,
        },
      })

      return resultSuccess(undefined)
    } catch (error) {
      return resultError(new ServerError(getErrorMessage(error)))
    }
  }
}
