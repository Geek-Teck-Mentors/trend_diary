import { ServerError } from '@/common/errors'
import { AsyncResult, resultError, resultSuccess } from '@/common/types/utility'
import { ArticleCommand } from '@/domain/article/repository'
import type { ReadHistory } from '@/domain/article/schema/readHistorySchema'
import { RdbClient } from '@/infrastructure/rdb'

export default class ArticleCommandImpl implements ArticleCommand {
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
      })

      const readHistory: ReadHistory = {
        readHistoryId: createdReadHistory.readHistoryId,
        userId: createdReadHistory.userId,
        articleId: createdReadHistory.articleId,
        readAt: createdReadHistory.readAt,
        createdAt: createdReadHistory.createdAt,
      }

      return resultSuccess(readHistory)
    } catch (error) {
      return resultError(new ServerError(error))
    }
  }

  async deleteAllReadHistory(userId: bigint, articleId: bigint): AsyncResult<void, Error> {
    try {
      await this.db.readHistory.deleteMany({
        where: {
          userId,
          articleId,
        },
      })

      return resultSuccess(undefined)
    } catch (error) {
      return resultError(new ServerError(error))
    }
  }
}
