import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { ArticleCommand } from '@/domain/article/repository'
import type { ReadHistory } from '@/domain/article/schema/readHistorySchema'
import { RdbClient } from '@/infrastructure/rdb'

export default class ArticleCommandImpl implements ArticleCommand {
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

      return success(readHistory)
    } catch (error) {
      return failure(new ServerError(error))
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

      return success(undefined)
    } catch (error) {
      return failure(new ServerError(error))
    }
  }
}
